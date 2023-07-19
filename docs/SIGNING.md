## Transaction Signing Samples

### Dogecoin

```bash
curl --location 'http://localhost:3000/v1/transaction/sign' \
--header 'Content-Type: application/json' \
--data '{
    "symbol": "DOGE",
    "data": {
        "inputs": [
            {
                "hash": "d8c62dd5efe2514245d764e49e7bc01d960b08a3b5dff535a054149fc359844f",
                "index": 0,
                "amount": 77.99999872,
                "address": "DCmovzNLwinAn8ZKijeexzeNY4JBZ2jKvk",
                "privateKey": "841a14abd481d808cc68aceba34e6d0ff6e5887ca33fbd9fb4e30074fc7380ca"
            },
            {
                "hash": "6a9352821e75788ca1ac5eb4bfc478181d9e8b421f63a61c198097b54411c7d3",
                "index": 1,
                "amount": 0.96259844,
                "address": "DCmovzNLwinAn8ZKijeexzeNY4JBZ2jKvk",
                "privateKey": "841a14abd481d808cc68aceba34e6d0ff6e5887ca33fbd9fb4e30074fc7380ca"
            }
        ],
        "outputs": [
            {
                "amount": 78.96259716,
                "address": "DTDR9eN41xTQSbJpVKFGnEEghwaSc5RpiJ"
            }
        ],
        "changeAddress": "DCmovzNLwinAn8ZKijeexzeNY4JBZ2jKvk"
    }
}'
```
