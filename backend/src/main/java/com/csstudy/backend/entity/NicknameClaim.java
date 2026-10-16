package com.csstudy.backend.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name="nickname_claims") @Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class NicknameClaim {
    @Id @Column(length=100) private String name;
    @Column(nullable=false,length=64) private String owner;
}
