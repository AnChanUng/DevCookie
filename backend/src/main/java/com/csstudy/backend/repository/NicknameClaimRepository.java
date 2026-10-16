package com.csstudy.backend.repository;
import com.csstudy.backend.entity.NicknameClaim;
import org.springframework.data.jpa.repository.JpaRepository;
public interface NicknameClaimRepository extends JpaRepository<NicknameClaim,String> {
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(value="insert into nickname_claims (name,owner) values (:name,:owner)",nativeQuery=true)
    void insertClaim(@org.springframework.data.repository.query.Param("name") String name,
                     @org.springframework.data.repository.query.Param("owner") String owner);
}
