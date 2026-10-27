# Afvalbeheer – Collecte de déchets

Sachez quand vos poubelles sont collectées, directement dans Gladys :
l'intégration lit le calendrier des collectes de votre adresse sur le service
public de votre collecteur, et vous donne des appareils, des déclencheurs et
des actions de scène, et des widgets de tableau de bord.

## Où fonctionne-t-elle ?

Uniquement en **Belgique** et aux **Pays-Bas**, pour les collecteurs
ci-dessous. Elle passe uniquement par internet (cloud) : le calendrier est lu
sur l'API du site ou de l'application du collecteur. Aucun compte n'est
nécessaire.

### Belgique

| Collecteur               | Zone                                                                                                                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Recycle!** (Fost Plus) | Toute la Belgique couverte par l'application Recycle! : **Wallonie** (Tibi – région de Charleroi, Ipalle – Wallonie picarde, Intradel – Liège, BEP – Namur, Hygea – Mons, inBW – Brabant wallon, IDELUX – Luxembourg, ICDI...), **Flandre** et **Bruxelles** |
| **Limburg.net**          | Province de Limbourg (Hasselt, Genk, Saint-Trond, Tongres...)                                                                                                                                                                                                |

### Pays-Bas

| Collecteur             | Zone                                               |
| ---------------------- | -------------------------------------------------- |
| Mijn Afvalwijzer       | ~100 municipalities using mijnafvalwijzer.nl       |
| ACV                    | Ede, Renkum, Wageningen, Veenendaal                |
| Almere                 | Almere                                             |
| Area Reiniging         | Emmen, Coevorden, Borger-Odoorn                    |
| Avalex                 | Delft, Rijswijk, Leidschendam-Voorburg...          |
| Avri                   | Rivierenland (Tiel, Culemborg...)                  |
| Blink                  | Helmond, Deurne, Gemert-Bakel...                   |
| Hellendoorn            | Hellendoorn                                        |
| Meerlanden             | Haarlemmermeer, Aalsmeer, Heemstede...             |
| Oostzaan               | Oostzaan                                           |
| RAD Hoeksche Waard     | Hoeksche Waard                                     |
| Twente Milieu          | Enschede, Hengelo, Almelo...                       |
| Venlo                  | Venlo                                              |
| Waardlanden            | Gorinchem, Molenlanden, Vijfheerenlanden           |
| Westland               | Westland                                           |
| Woerden                | Woerden                                            |
| Assen                  | Assen                                              |
| BAR-Afvalbeheer        | Barendrecht, Albrandswaard, Ridderkerk             |
| Breda                  | Breda                                              |
| Groningen              | Groningen                                          |
| Nijkerk                | Nijkerk                                            |
| RMN (Midden-Nederland) | Midden-Nederland (Baarn, Soest, Zeist...)          |
| Tilburg                | Tilburg                                            |
| Afval3xBeter           | Municipalities using afval3xbeter.nl               |
| Afvalstoffendienst     | 's-Hertogenbosch, Heusden, Vught                   |
| Alphen aan den Rijn    | Alphen aan den Rijn                                |
| Berkelland             | Berkelland                                         |
| Cranendonck            | Cranendonck                                        |
| Cyclus                 | Gouda region, Montfoort, Uithoorn...               |
| Dar                    | Nijmegen, Berg en Dal, Beuningen...                |
| De Fryske Marren       | De Fryske Marren                                   |
| Den Haag               | Den Haag                                           |
| GAD                    | Gooi en Vechtstreek (Hilversum, Huizen...)         |
| HVC                    | Alkmaar, Dordrecht, Flevoland, Noord-Holland...    |
| Lingewaard             | Lingewaard                                         |
| Middelburg-Vlissingen  | Middelburg, Vlissingen                             |
| Mijn Afvalzaken        | Municipalities using mijnafvalzaken.nl             |
| Ôffalkalinder          | Frisian municipalities using offalkalinder.nl      |
| Peel en Maas           | Peel en Maas                                       |
| PreZero                | PreZero (ex-Suez) municipalities                   |
| Purmerend              | Purmerend                                          |
| RWM                    | Roerdalen, Roermond, Maasgouw...                   |
| Saver                  | Roosendaal, Bergen op Zoom, Woensdrecht...         |
| Schouwen-Duiveland     | Schouwen-Duiveland                                 |
| Sliedrecht             | Sliedrecht                                         |
| Spaarnelanden          | Haarlem, Zandvoort                                 |
| Súdwest-Fryslân        | Súdwest-Fryslân                                    |
| Venray                 | Venray                                             |
| Voorschoten            | Voorschoten                                        |
| Waalre                 | Waalre                                             |
| ZRD                    | Zeeland municipalities using zrd.nl                |
| Circulus               | Apeldoorn, Deventer, Zutphen, Epe...               |
| Drimmelen              | Drimmelen                                          |
| Irado                  | Schiedam, Vlaardingen, Capelle aan den IJssel      |
| Maassluis              | Maassluis                                          |
| Oude IJsselstreek      | Oude IJsselstreek                                  |
| RD4                    | Parkstad Limburg (Heerlen, Kerkrade, Landgraaf...) |
| Reinis                 | Municipalities using reinis.nl                     |
| ROVA                   | Zwolle, Amersfoort, Kampen...                      |

Votre collecteur n'est pas dans la liste ? Ouvrez une issue sur le
[dépôt GitHub](https://github.com/gboulvin/Gladys-Afvalbeheer/issues).

## Configuration

1. Ouvrez l'onglet **Configuration** de l'intégration.
2. Choisissez votre **collecteur de déchets**. En Belgique, c'est
   **Recycle!** presque partout (**Limburg.net** dans la province de
   Limbourg).
3. Choisissez votre **maison** : son adresse est retrouvée d'après sa
   position sur la carte (paramètres de Gladys → Maisons), via OpenStreetMap.
   C'est tout ce dont la plupart des utilisateurs ont besoin.
4. Les champs d'**adresse** sont facultatifs : laissez-les vides pour
   utiliser l'adresse de la maison, ou ne remplissez que ce qui doit être
   corrigé — en général le **numéro** (et son **complément**, ex. `A` ou
   `bis`) si la maison est placée chez le voisin, ou le **nom de rue** s'il
   n'est pas écrit comme dans l'application Recycle! (ex.
   `Rue de la Montagne`). Sans maison, renseignez le code postal et le numéro
   (plus le nom de rue pour Recycle! et Limburg.net, et la commune pour
   Limburg.net).
5. Choisissez la **langue** des noms d'appareils et des textes de scène
   (anglais, français, allemand, espagnol ou néerlandais), et les **heures**
   des rappels du soir et du matin (19 h et 7 h par défaut).
6. Enregistrez, puis cliquez sur **Lire le calendrier maintenant** : le
   message sous le bouton indique le nombre de collectes trouvées et la
   prochaine.
7. Ouvrez l'onglet **Découverte** et ajoutez les appareils voulus : un par
   type de déchet collecté à votre adresse.

Le calendrier est relu toutes les 12 heures (réglable). Si le collecteur est
injoignable, le dernier calendrier connu reste utilisé, l'état de connexion le
signale et l'intégration réessaie 15 minutes plus tard.

## Appareils

Un appareil par type de déchet (« Collecte – Papiers-cartons »...), avec deux
fonctionnalités :

- **Jours avant la collecte** — `0` le jour de la collecte, `1` la veille…
- **Prochaine collecte** — la date en toutes lettres (« vendredi 16 octobre »).

Types de déchets : ordures ménagères, déchets organiques, PMC, papiers-cartons,
verre, textile, déchets verts, encombrants, déchets dangereux, sapins de Noël,
plastiques souples ; une fraction inconnue de l'intégration garde son propre
nom.

## Scènes

**Déclencheurs** (Gladys 5.3 ou plus récent, catégorie **Intégrations**) :

- **Collecte de déchets demain** — déclenché à l'heure du rappel du soir, une
  fois par type de déchet collecté le lendemain.
- **Collecte de déchets aujourd'hui** — déclenché à l'heure du rappel du
  matin, une fois par type de déchet collecté le jour même.

Vous pouvez choisir les types de déchets auxquels la scène réagit ; laissé
vide, tous conviennent. Les actions suivantes peuvent utiliser
`{{triggerEvent.data.waste_name}}`, `{{triggerEvent.data.date_text}}`,
`{{triggerEvent.data.date}}`, `{{triggerEvent.data.waste_type}}` et
`{{triggerEvent.data.all_waste_names}}` (tout ce qui est collecté ce
jour-là). Exemple : _« Demain : sortez la poubelle
{{triggerEvent.data.waste_name}} »_ envoyé par Telegram.

Un rappel n'est jamais envoyé deux fois, même après un redémarrage. Si Gladys
démarre plus de 3 heures après l'heure du rappel, le rappel du jour est
sauté.

**Actions :**

- **Obtenir la prochaine collecte** — d'un type de déchet, ou de n'importe
  lequel. Sorties : `found`, `waste_type`, `waste_name`, `date`, `date_text`,
  `days_until`.
- **Mettre à jour le calendrier des collectes** — relit le calendrier
  maintenant. Sortie : `collections_count`.

## Tableau de bord

- **Prochaine collecte** — ce qui est collecté ensuite, quand et dans combien
  de jours, avec un bouton **Actualiser**.
- **Collectes à venir** — la liste des prochaines collectes (1 à 8, 5 par
  défaut) avec un badge « Aujourd'hui / Demain / Dans N j ».

## Dépannage

- _« street … not found »_ : écrivez le nom de rue exactement comme
  l'application Recycle! l'affiche, avec ses accents.
- _« returned no collection for this address »_ : vérifiez le collecteur, le
  code postal et le numéro sur le site du collecteur.
- Logs : ouvrez les logs de l'intégration dans Gladys (`LOG_LEVEL=debug` pour
  plus de détails). Retirez votre adresse avant de les partager.

Les données proviennent des services publics des collecteurs ; l'intégration
n'est pas affiliée à ces derniers.
