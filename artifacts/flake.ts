/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/flake.json`.
 */
export type Flake = {
  "address": "8rT4b7dXQJxXpumCq45UCekRTwXiRBjJG5kVXnqvd4bd",
  "metadata": {
    "name": "flake",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "acceptRequest",
      "discriminator": [
        4,
        60,
        28,
        227,
        25,
        199,
        246,
        124
      ],
      "accounts": [
        {
          "name": "pair",
          "writable": true
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "requestIndex",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createPair",
      "discriminator": [
        156,
        190,
        126,
        151,
        163,
        62,
        192,
        220
      ],
      "accounts": [
        {
          "name": "factory",
          "writable": true
        },
        {
          "name": "pair",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  105,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "factory.pairs_count",
                "account": "factory"
              }
            ]
          }
        },
        {
          "name": "attentionTokenMint",
          "writable": true
        },
        {
          "name": "creatorTokenAccount",
          "writable": true
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pair"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "createPairParams"
            }
          }
        }
      ]
    },
    {
      "name": "initializeFactory",
      "discriminator": [
        179,
        64,
        75,
        250,
        39,
        254,
        240,
        178
      ],
      "accounts": [
        {
          "name": "factory",
          "writable": true,
          "signer": true
        },
        {
          "name": "feeRecipient"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "protocolFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "submitRequest",
      "discriminator": [
        122,
        30,
        180,
        251,
        206,
        230,
        254,
        57
      ],
      "accounts": [
        {
          "name": "pair",
          "writable": true
        },
        {
          "name": "attentionTokenMint",
          "writable": true
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "creatorTokenAccount",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "requestIndex",
          "type": "u8"
        },
        {
          "name": "adText",
          "type": "string"
        }
      ]
    },
    {
      "name": "swap",
      "discriminator": [
        248,
        198,
        158,
        145,
        225,
        117,
        135,
        200
      ],
      "accounts": [
        {
          "name": "pair",
          "writable": true
        },
        {
          "name": "attentionTokenMint",
          "writable": true
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "creator",
          "writable": true
        },
        {
          "name": "factory",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pair"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "amountIn",
          "type": "u64"
        },
        {
          "name": "minimumAmountOut",
          "type": "u64"
        },
        {
          "name": "isBuy",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "factory",
      "discriminator": [
        159,
        68,
        192,
        61,
        48,
        249,
        216,
        202
      ]
    },
    {
      "name": "pair",
      "discriminator": [
        85,
        72,
        49,
        176,
        182,
        228,
        141,
        82
      ]
    }
  ],
  "events": [
    {
      "name": "pairCreated",
      "discriminator": [
        173,
        73,
        77,
        43,
        235,
        157,
        56,
        30
      ]
    },
    {
      "name": "requestAccepted",
      "discriminator": [
        49,
        16,
        162,
        180,
        83,
        220,
        40,
        133
      ]
    },
    {
      "name": "requestSubmitted",
      "discriminator": [
        113,
        213,
        202,
        246,
        213,
        106,
        73,
        44
      ]
    },
    {
      "name": "swapExecuted",
      "discriminator": [
        150,
        166,
        26,
        225,
        28,
        89,
        38,
        79
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidProtocolFee",
      "msg": "Protocol fee must be between 0 and 10000 (100%)"
    },
    {
      "code": 6001,
      "name": "invalidBasePrice",
      "msg": "Base price must be greater than 0"
    },
    {
      "code": 6002,
      "name": "invalidStringLength",
      "msg": "String length exceeds maximum allowed"
    },
    {
      "code": 6003,
      "name": "invalidRequestPrice",
      "msg": "Request price must be greater than 0"
    },
    {
      "code": 6004,
      "name": "slippageExceeded",
      "msg": "Slippage tolerance exceeded"
    },
    {
      "code": 6005,
      "name": "invalidRequestIndex",
      "msg": "Invalid request index"
    },
    {
      "code": 6006,
      "name": "adTextTooLong",
      "msg": "Ad text too long"
    },
    {
      "code": 6007,
      "name": "insufficientTokens",
      "msg": "Insufficient tokens"
    },
    {
      "code": 6008,
      "name": "unauthorizedCaller",
      "msg": "Unauthorized caller"
    },
    {
      "code": 6009,
      "name": "requestNotFound",
      "msg": "Request not found or not in pending status"
    },
    {
      "code": 6010,
      "name": "requestAlreadyProcessed",
      "msg": "Request has already been processed"
    }
  ],
  "types": [
    {
      "name": "createPairParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "ticker",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "tokenImage",
            "type": "string"
          },
          {
            "name": "twitter",
            "type": "string"
          },
          {
            "name": "telegram",
            "type": "string"
          },
          {
            "name": "website",
            "type": "string"
          },
          {
            "name": "basePrice",
            "type": "u64"
          },
          {
            "name": "requests",
            "type": {
              "vec": {
                "defined": {
                  "name": "requestConfig"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "factory",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "feeRecipient",
            "type": "pubkey"
          },
          {
            "name": "protocolFee",
            "type": "u64"
          },
          {
            "name": "pairsCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "pair",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "attentionTokenMint",
            "type": "pubkey"
          },
          {
            "name": "creatorTokenAccount",
            "type": "pubkey"
          },
          {
            "name": "basePrice",
            "type": "u64"
          },
          {
            "name": "protocolFee",
            "type": "u64"
          },
          {
            "name": "creatorFee",
            "type": "u64"
          },
          {
            "name": "creationNumber",
            "type": "u64"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "ticker",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "tokenImage",
            "type": "string"
          },
          {
            "name": "twitter",
            "type": "string"
          },
          {
            "name": "telegram",
            "type": "string"
          },
          {
            "name": "website",
            "type": "string"
          },
          {
            "name": "requests",
            "type": {
              "vec": {
                "defined": {
                  "name": "requestConfig"
                }
              }
            }
          },
          {
            "name": "pendingRequests",
            "type": {
              "vec": {
                "defined": {
                  "name": "request"
                }
              }
            }
          },
          {
            "name": "s0",
            "type": "u64"
          },
          {
            "name": "pmin",
            "type": "u64"
          },
          {
            "name": "pmax",
            "type": "u64"
          },
          {
            "name": "smax",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "pairCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pairId",
            "type": "u64"
          },
          {
            "name": "pairKey",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "basePrice",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "request",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "requestIndex",
            "type": "u8"
          },
          {
            "name": "adText",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "requestStatus"
              }
            }
          }
        ]
      }
    },
    {
      "name": "requestAccepted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "requestIndex",
            "type": "u8"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "requestConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "description",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "requestStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "accepted"
          },
          {
            "name": "rejected"
          },
          {
            "name": "refunded"
          }
        ]
      }
    },
    {
      "name": "requestSubmitted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pairKey",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "requestIndex",
            "type": "u8"
          },
          {
            "name": "adText",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "swapExecuted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isBuy",
            "type": "bool"
          },
          {
            "name": "amountIn",
            "type": "u64"
          },
          {
            "name": "amountOut",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "pairKey",
            "type": "pubkey"
          },
          {
            "name": "attentionTokenMint",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
