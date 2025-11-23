# POST a fragment without authentication
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
`This is an unauthenticated fragment!`

# Expecting a 401 Unauthorized response
HTTP/1.1 401
