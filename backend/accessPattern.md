# Data Model

## Item Type and Index Values

| Item Type          | PK           | SK            | GSI1PK      | GSI1SK        | GSI2PK | GSI2SK       |
| :----------------- | :----------- | :------------ | :---------- | :------------ | ------ | ------------ |
| User               | u#${id}      | metadata      |             |               |        |              |
| Book               | b#${id}      | metadata      | u#{ownerId} | b#{addedDate} | b#     | ${createdAt} |
| Trade              | t#${id}      | metadata      | t#{status}  | ${createdAt}  |        |              |
| TradeRequesterBook | t#${tradeId} | trb#${bookId} | b#${bookId} | t#${tradeId}  |        |              |
| TradeDeciderBook   | t#${tradeId} | tdb#${bookId} | b#${bookId} | t#${tradeId}  |        |              |
| TradeRequester     | t#${tradeId} | tr#${userId}  | tr#{userId} | t#${tradeId}  |        |              |
| TradeDecider       | t#${tradeId} | td#${userId}  | td#{userId} | t#${tradeId}  |        |              |

## Access Pattern

| Access Patterns                                  | Index | Key Condition                               | Filter Expression | Example                                   |
| :----------------------------------------------- | :---- | :------------------------------------------ | :---------------- | :---------------------------------------- |
| 1. Get user for a given userId                   | Table | PK=u#${id}                                  | -                 | PK="u#u1"                                 |
| 2. Get book for a given bookId                   | Table | PK=b#${id}                                  | -                 | PK="b#b1"                                 |
| 3. Get trade for a given tradeId                 | Table | PK=t#tradeId                                | -                 | PK="t#t1"                                 |
| 4. Get all books                                 | GSI2  | GSI2PK='b#'                                 | -                 | GSI2PK="b#"                               |
| 5. Get all books for a given userId              | GSI1  | GSI1PK=u#userId and GSISK=begin_with 'b#'   | -                 | GSI2PK="u#u1" and GSI2SK=begin_with 'b#'  |
| 6. Get all books for a given tradeId             | Table | PK=t#tradeId                                | -                 | PK="t#t1"                                 |
| 7. Get Trade Requester for a given tradeId       | Table | PK=t#tradeId                                | -                 | PK="t#t1" and                             |
| 8. Get Trade Decider for a given tradeId         | Table | PK=t#tradeId                                | -                 | PK="u#t1"                                 |
| 9. Get all trade for a given Trade Decider Id    | GSI1  | GSI1PK=td#userId and GSI1SK=begin_with 't#' | -                 | GSI1PK="td#u1" and GSI1SK=begin_with 't#' |
| 10. Get all trade for a given Trade Requester Id | GSI1  | GSI1PK=tr#userId and GSI1SK=begin_with 't#' | -                 | GSI1PK="tr#u1" and GSI1SK=begin_with 't#' |
| 11. Get all trade for a given bookId             | GSI1  | GSI1PK=b#bookId and GSI1SK=begin_with 't#'  | -                 | GSI1PK="ti#b1" and GSI1SK=begin_with 't#' |
| 12. Get all trade for a given status             | GSI1  | GSI1PK=t#${status}                          | -                 | GSI1PK="t#accepted"                       |

## Visualization

### Table

![Table](docs/resource/AccessPattern-Table.png)

### GSI1

![GSI1](docs/resource/AccessPattern-GSI1.png)
