# Create fragment

POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Fragment v1`

HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.size" == 11
[Captures]
url: header "Location"
id: jsonpath "$.fragment.id"

# Get fragment

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
Content-Length: 11
[Asserts]
body == "Fragment v1"

# Get fragment

GET {{url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragment.id" == {{id}}

# Update fragment

PUT {{url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Fragment v2`

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{id}}
jsonpath "$.fragment.type" == "text/plain"

# Check updated fragment

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "Fragment v2"
# jsonpath "$.fragment.id" == {{id}}
