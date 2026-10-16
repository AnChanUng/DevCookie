package com.csstudy.backend.service;
import jakarta.annotation.PreDestroy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.*;
@Service
public class PromotionStreamService {
    private final Set<SseEmitter> clients=ConcurrentHashMap.newKeySet();
    private record Delivered(int level,long at) {}
    private final Map<String,Delivered> delivered=new HashMap<>();
    private final ExecutorService delivery=new ThreadPoolExecutor(1,1,0,TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(128),task->{var thread=new Thread(task,"promotion-stream");thread.setDaemon(true);return thread;},
            new ThreadPoolExecutor.DiscardOldestPolicy());
    public SseEmitter subscribe() {
        if(clients.size()>=200) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE);
        var emitter=new SseEmitter(120_000L);clients.add(emitter);
        emitter.onCompletion(()->clients.remove(emitter));
        emitter.onTimeout(()->{clients.remove(emitter);emitter.complete();});
        emitter.onError(error->clients.remove(emitter));
        delivery.execute(()->send(emitter,"connected",""));
        return emitter;
    }
    @TransactionalEventListener(fallbackExecution=true)
    public synchronized void promoted(PromotionNoticeService.Promoted event) {
        long now=System.currentTimeMillis();
        delivered.entrySet().removeIf(entry->entry.getValue().at()<now-60_000);
        var previous=delivered.get(event.subjectKey());
        if(previous!=null && previous.level()>=event.level()) return;
        delivered.put(event.subjectKey(),new Delivered(event.level(),now));
        // Only currently connected browsers receive the event; no history is replayed on reconnect.
        var recipients=Set.copyOf(clients);
        delivery.execute(()->recipients.forEach(client->send(client,"promotion",event.notice())));
    }
    @Scheduled(fixedDelay=15000)
    public void heartbeat() {
        var recipients=Set.copyOf(clients);
        delivery.execute(()->recipients.forEach(client->send(client,"heartbeat","")));
    }
    private void send(SseEmitter emitter,String event,Object value) {
        if(!clients.contains(emitter)) return;
        try{emitter.send(SseEmitter.event().name(event).data(value));}
        catch(IOException|IllegalStateException error){clients.remove(emitter);emitter.complete();}
    }
    @PreDestroy public void close(){clients.forEach(SseEmitter::complete);delivery.shutdownNow();}
}
