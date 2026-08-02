"""Unit tests for `app.core.security`."""

from __future__ import annotations

import os

import pytest

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-that-is-at-least-32-chars-long")
os.environ.setdefault("POSTGRES_PASSWORD", "test-password")

from app.core.exceptions import TokenError
from app.core.security import (
    TokenType,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


class TestPasswordHashing:
    def test_hash_is_not_plaintext(self) -> None:
        hashed = hash_password("Sup3rSecure!Pass")
        assert hashed != "Sup3rSecure!Pass"

    def test_verify_correct_password_succeeds(self) -> None:
        hashed = hash_password("Sup3rSecure!Pass")
        assert verify_password("Sup3rSecure!Pass", hashed) is True

    def test_verify_incorrect_password_fails(self) -> None:
        hashed = hash_password("Sup3rSecure!Pass")
        assert verify_password("WrongPassword!1", hashed) is False

    def test_hashing_same_password_twice_produces_different_hashes(self) -> None:
        # bcrypt salts each hash, so two hashes of the same password differ.
        assert hash_password("Sup3rSecure!Pass") != hash_password("Sup3rSecure!Pass")


class TestTokens:
    def test_access_token_round_trip(self) -> None:
        token = create_access_token("user-123", "admin")
        payload = decode_token(token, expected_type=TokenType.ACCESS)
        assert payload.sub == "user-123"
        assert payload.role == "admin"
        assert payload.type == TokenType.ACCESS

    def test_refresh_token_round_trip(self) -> None:
        token = create_refresh_token("user-123", "viewer")
        payload = decode_token(token, expected_type=TokenType.REFRESH)
        assert payload.type == TokenType.REFRESH

    def test_access_token_rejected_when_refresh_expected(self) -> None:
        token = create_access_token("user-123", "admin")
        with pytest.raises(TokenError):
            decode_token(token, expected_type=TokenType.REFRESH)

    def test_tampered_token_is_rejected(self) -> None:
        token = create_access_token("user-123", "admin")
        tampered = token[:-4] + "abcd"
        with pytest.raises(TokenError):
            decode_token(tampered)

    def test_malformed_token_is_rejected(self) -> None:
        with pytest.raises(TokenError):
            decode_token("not-a-jwt-at-all")

    def test_each_token_has_unique_jti(self) -> None:
        t1 = decode_token(create_access_token("u1", "viewer"))
        t2 = decode_token(create_access_token("u1", "viewer"))
        assert t1.jti != t2.jti
