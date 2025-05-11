package com.oss.maeumnaru.user.repository;

import org.springframework.data.repository.CrudRepository;

public interface RefreshTokenInfoRedisRepository extends CrudRepository<RefreshTokenInfo, String> {
}