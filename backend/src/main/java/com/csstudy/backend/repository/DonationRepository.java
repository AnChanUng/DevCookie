package com.csstudy.backend.repository;

import com.csstudy.backend.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {

    // 목록 화면에 쓰는 요약. 파일 본문은 빼고 읽는다
    @Query("select d.id, d.createdAt, d.kind, d.label, d.note, d.filename, d.size, d.handled " +
            "from Donation d order by d.id desc")
    List<Object[]> summaries();

    // 한 방문자가 하루에 올릴 수 있는 자료 수를 막는 데 쓴다
    long countByVisitorIdAndDay(String visitorId, LocalDate day);

    long countByHandledFalse();
}
