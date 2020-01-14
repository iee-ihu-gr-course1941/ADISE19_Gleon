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
            * [Update Board](#update-board)
            * [Αρχικοποίηση Board](#αρχικοποίηση-board)
         * [User](#user)
            * [Ανάγνωση στοιχείων παίκτη](#ανάγνωση-στοιχείων-παίκτη)
        * [Register](#register)
        * [Login](#login)
         * [Status](#status)
            * [Ανάγνωση κατάστασης παιχνιδιού](#ανάγνωση-κατάστασης-παιχνιδιού)
      * [Entities](#entities)
         * [Board](#board-1)
         * [Card](#card-1)
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
___
## Περιορισμοί - Απλοποίηση κανόνων - Bugs
**Οι παρακάτω περιορισμοί/απλοποίηση κανόνων υπάρχουν για την απλούστεψει της εφαρμογής, θα αφαιρεθούν στο μέλλον.
<br/>
Τα bug δεν ήταν σκόπιμα, προφανώς :P (θα αφαιρεθούν στο μέλλον, λογικά).
Σκοπός της εφαρμογής είναι η επίδειξη ενός απλού multiplayer REST Api.**
___
- Max 2 players : Πρός το παρόν δεν επιτρέπεται login τρίτου ατόμου στην εφαρμογή γιατι μόνο ενα παιχίδι μπορεί να υπάρχει κάθε φορά.
- Υπάρχει ενα bug και δεν αφήνει μια συγκεκριμένη κάρτα να κάνει render, η καρτα ειναι AD.png(άσος καρό).
- Μερικές φορές δε κάνει render το starting hand των παικτών ενώ έχει αναβαθμιστεί η βάση. Το πρόβλημα λύνεται αν ξαναπαμε στο ιδιο URL. Είναι λογικά πρόβλημα με το EJS και το templating. Η επίλυση θέλει παραπάνω επιθεώρηση.

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


### Register
```
POST /register
```
Κατά την εγγραφή ενός καινούργιου χρήστη/παίκτη.

### Login
```
POST /login
```
Κατά την είσοδο ενός χρήστη/παίκτη στο σύστημα.

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

### Card
---------

Το βασικότερο στοιχείο του παιχνιδιού, η κάρτα.
<br/>
Κάτω είναι η μορφή που έχει το document. Συγκεκριμένα είναι το 2 καρδιά.
```
{
    "_id" : ObjectId("5e0f6f14fbe03d6891ffa771"),
    "suit" : "H",
    "value" : 2
}
```
| Attribute    | Description                             | Values        |
| :---:        |     :---:                               |    :---:      |
| _id          | Ταυτότητα της κάρτας                    | ObjectId("")  |
| suit         | Το σχήμα της κάρτας                     | String        |
| value        | Η αξία/αριθμός της κάρτας               | String        |

### Users
---------

Το στοιχείο χρήστης/παίκτης.
<br/>
Κάτω είναι η μορφή που έχει το document:
```
{
    "_id" : ObjectId(""),
    "username" : String,
    "currentTurn" : Boolean,
    "startingHand" : [],
    "cardsTaken" : [],
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
| cardsTaken   | Τα φύλλα που έχει μαζέψει ο παίκτης     | Array[card]   |

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
