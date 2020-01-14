ΑΔΙΣΕ Project
Online Card Game - ΞΕΡΗ

Περιεχόμενα
=================
   * [Εγκατάσταση](#εγκατάσταση)
      * [Απαιτήσεις](#απαιτήσεις)
      * [Οδηγίες Εγκατάστασης](#οδηγίες-εγκατάστασης)
   * [Περιγραφή API](#περιγραφή-api)
      * [Methods](#methods)
         * [Board](#board)
            * [Ανάγνωση Board](#ανάγνωση-board)
            * [Αρχικοποίηση Board](#αρχικοποίηση-board)
         * [User](#user)
            * [Ανάγνωση στοιχείων παίκτη](#ανάγνωση-στοιχείων-παίκτη)
         * [Status](#status)
            * [Ανάγνωση κατάστασης παιχνιδιού](#ανάγνωση-κατάστασης-παιχνιδιού)
      * [Entities](#entities)
         * [Board](#board-1)
         * [Users](#users)
         * [Game-status](#game-status)


# Demo Page

Coming soon...

# Εγκατάσταση

## Απαιτήσεις

NodeJS <br/>
mongoDB


## Οδηγίες Εγκατάστασης

* Ανοίγουμε το command line και ανοίγουμε καινούργιο tab όπου θα τρέξουμε το mongoDB <br/>
  `mongod`
 * Στο tab που μένει, πάμε εκεί που βρίσκετε το project <br/>
  `cd ADISE19_Gleon`
* Εφόσων είμαστε στο φάκελο του project γράφουμε<br/>

```
  npm install
  node app.js
```
* Ανοίγουμε κάποιο browser και πάμε http://localhost:3000<br/>

# Περιγραφή Παιχνιδιού

Παίζετε με 2 παίκτες και χρησιμοποιείται μια τράπουλα των 52 φύλλων.
<br/>
<br/>
 Σε κάθε γύρο του παιχνιδιού μοιράζονται 6 κάρτες σε κάθε παίκτη.
Πριν αρχίσει ο πρώτος γύρος ρίχνονται 4 κάρτες στο τραπέζι (η μία πάνω από την άλλη).
<br/>
<br/>
Οι δύο παίκτες παίζουν εναλλάξ, ρίχνοντας ένα χαρτί από αυτά που τους έχουν μοιραστεί στο τραπέζι. Αν ένας παίκτης ρίξει χαρτί με ίδιο αριθμό με αυτό που είχε ριχτεί τελευταίο, μαζεύει τα χαρτιά που βρίσκονται στο τραπέζι.
Αν στο τραπέζι βρισκόταν ένα μόνο χαρτί, κάνει «ξερή».
Αν ένας παίκτης ρίξει βαλέ, παίρνει όλα τα χαρτιά που βρίσκονται στο τραπέζι.
Νικητής είναι αυτός που στο τέλος του παιχνιδιού θα έχει τους περισσότερους πόντους.
<br/>

## Συντελεστές

Full Stack: Γιώργος Λεωνίδης


# Περιγραφή API

## Methods


### Board
#### Update Board

```
POST /update
```
Κάθε φορά που παίζει κάποιος παίκτης στον γύρο του, δηλαδή σύρει μια κάρτα στο τραπέζι και την αφήσει. Στέλνετε αίτημα POST update που αφαιρεί την κάρτα που έπαιξε και τη βάζει στο τραπέζι.

#### Αρχικοποίηση Board
```
POST /game
```
Όταν έχουν μπεί δύο άτομα στο σύστημα και πατήσουν έναρξη παιχνιδιού,
αρχίζει το παιχνίδι, μοιράζονται τα φύλλα στους παίκτες και γίνεται αρχικοποίηση των turns.


### User

#### Ανάγνωση στοιχείων παίκτη

```
GET /users
```
Επιστρέφει τα στοιχεία όλων των εγγεγραμένων παικτών στη βάση δεδομένων.

```
GET /users/:u
```
Επιστρέφει τα στοιχεία του παίκτη u. Το u είναι το username του παίκτη.

### Status

#### Ανάγνωση κατάστασης παιχνιδιού
```
GET /status/
```

Επιστρέφει το στοιχείο [Game-status](#Game-status).



## Entities


### Board
---------

Το board είναι ένας πίνακας, που περιέχει τα χαρτιά που βρίσκονται αυτή τη στιγμή πάνω στο τραπέζι.
Αποθηκέυται σε μορφή π.χ "AD" όπου A = Ace και D = Diamonds. Αυτό το κάνει πιο εύκολο να κάνω render
τα png απο τα χαρτιά απο τον φάκελο /images.  

### Users
---------

O κάθε παίκτης έχει τα παρακάτω στοιχεία:
```
{
    "_id" : ObjectId(""),
    "username" : String,
    "currentTurn" : Boolean,
    "startingHand" : [],
    "salt" : "",
    "hash" : "",
    "__v" : 0
}
```
| Attribute    | Description                             | Values        |
| :---:        |     :---:                               |    :---:      |
| _id          | Ταυτότητα του χρήστη                    | ObjectId("")  |
| username     | Όνομα χρήστη                            | String        |
| password     | Ο κωδικός αποθηκευεται κρυπτογραφημένος | String        |
| currentTurn  | Αν είναι η οχι η σειρά του παίκτη       | Boolean       |
| startingHand | Τα φύλλα που κρατάει ο παικτης καθε φορα| Array[card]   |

### Game-status
---------
Αν δεν έχει ξεκίνησει κάποιο παιχνίδι θα εμφανίζει το αντίστοιχο μήνυμα.
***
H κατάσταση παιχνιδιού έχει τα παρακάτω στοιχεία:
***
| Attribute    | Description                                      | Values        |
| :---:        |     :---:                                        |    :---:      |
| currentTurn  | Ποιός παίκτης παίζει αυτή τη στιγμή              | Boolean       |
| board        | Πόσα φύλλα υπάρχουν αυτη τη στιγμή στο τραπέζι   | Integer       |
| player1Cards | Πόσα φύλλα έχει μαζεμένα ο πρώτος παίκτης        | Integer       |
| player2Cards | Πόσα φύλλα έχει μαζεμένα ο δεύτερος παίκτης      | Integer       |
