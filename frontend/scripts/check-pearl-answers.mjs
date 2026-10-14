import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { PEARL_QUESTIONS } from '../src/data/pearlQuestions.js';
const q=id=>PEARL_QUESTIONS.find(q=>q.id===id);
const db=new DatabaseSync(':memory:');
try {
 db.exec("CREATE TABLE orders(user_id INTEGER, amount INTEGER, status TEXT); INSERT INTO orders VALUES (1,60,'paid'),(1,60,'paid'),(2,100,'cancelled'),(2,30,'paid'),(3,90,'paid');");
 assert.deepEqual(db.prepare(q('pa09').code).all().map(r=>r.user_id),[1]);
 assert.equal(q('pa09').o[q('pa09').a],'1만');
 db.exec('DROP TABLE orders; CREATE TABLE users(id INTEGER PRIMARY KEY); INSERT INTO users VALUES(1),(2); CREATE TABLE orders(id INTEGER PRIMARY KEY,user_id INTEGER); INSERT INTO orders VALUES(10,1),(11,1);');
 assert.deepEqual(db.prepare(q('pa10').code).all().map(r=>[r.user_id,r.n]),[[1,2],[2,0]]);
 assert.equal(q('pa10').o[q('pa10').a],'(1,2),(2,0)');
 // Verify the conditional stock update: only the first request can reserve stock=1.
 db.exec('CREATE TABLE products(id INTEGER PRIMARY KEY, stock INTEGER);INSERT INTO products VALUES(1,1);');
 const reserve=db.prepare('UPDATE products SET stock=stock-1 WHERE id=? AND stock>0');
 assert.equal(reserve.run(1).changes,1);assert.equal(reserve.run(1).changes,0);
 assert.equal(db.prepare('SELECT stock FROM products').get().stock,0);
 // Demonstrate the ON vs WHERE counterexample described in the essay.
 db.exec("ALTER TABLE orders ADD COLUMN status TEXT; UPDATE orders SET status='cancelled';");
 assert.equal(db.prepare("SELECT u.id FROM users u LEFT JOIN orders o ON o.user_id=u.id AND o.status='paid'").all().length,2);
 assert.equal(db.prepare("SELECT u.id FROM users u LEFT JOIN orders o ON o.user_id=u.id WHERE o.status='paid'").all().length,0);
 assert.deepEqual(db.prepare("SELECT u.id FROM users u LEFT JOIN orders o ON o.user_id=u.id WHERE o.status='paid' OR o.id IS NULL").all().map(r=>r.id),[2]);
} finally {db.close();}
const stack=[],out=[];stack.push(1,2);out.push(stack.pop());stack.push(3);out.push(stack.pop(),stack.pop());
assert.equal(q('pa32').o[q('pa32').a],out.join(','));
const lower=(xs,target)=>{let lo=0,hi=xs.length;while(lo<hi){const m=lo+Math.floor((hi-lo)/2);if(xs[m]<target)lo=m+1;else hi=m;}return lo;};
assert.equal(Number(q('pa30').o[q('pa30').a]),lower([1,3,3,3,8],3));
for(const [xs,t,want] of [[[],3,0],[[1,3,3,3,8],9,5],[[1,3,3,3,8],0,0],[[3,3],3,0]])assert.equal(lower(xs,t),want);
console.log('Answer checks passed: SQL aggregate/JOIN, atomic stock decrement, ON/WHERE/NULL counterexample, stack, binary-search boundaries.');
