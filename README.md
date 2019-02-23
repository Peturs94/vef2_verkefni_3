# Verkefni 3

Verkefni 3 byggir á [verkefni 2](https://github.com/vefforritun/vef2-2019-v2) og bætir við notendaumsjón með nýskráningu og meðhöndlun á notendum.

## Útlit

Útlit fyrir viðbætur er gefið í möppu `utlit/`, bæði fyrir `1200px` breiðan skjá og `400px` breiðan. Útlit fylgir [sömu forskrift og í verkefni 2](https://github.com/vefforritun/vef2-2019-v2#%C3%BAtlit).

## Leiðarkerfi

Við síðuna bætist leiðarkerfi. Það er birt á hverri síðu og sýnir með feitletrun og undirstrikun hvaða síðu maður er á.

Ef notandi er innskráður skal birta vinstra megin notandanafn og hlekk til að útskrá.

Í minni skjám er efni fyrst síðan leiðarkerfi og að lokum notandi.

Á breiðari skjám er leiðarkerfi efst til vinstri, notandi efst til hægri og efni þar fyrir neðan.

## Notendaumsjón

Útfæra skal notendaumsjón með [`passport.js`](http://www.passportjs.org/), [`passport-local`](https://github.com/jaredhanson/passport-local) og [`express-session`](https://github.com/expressjs/session).

Fyrir `express-session` skal skrá `sessionSecret` og skal það vera sótt úr `.env`, sjá gefin kóða í `app.js`.

Setja skal upp innskráningu á `/login` sem flettir upp notanda í gagngagrunni og skráir inn ef til og rétt lykilorð er gefið.

Setja skal upp notendaskráningu á `/register` sem leyfir notanda að skrá sig. Fyrir notanda skal skrá og uppfylla:

* Nafn
  * Má ekki vera tómt
* Netfang
  * Má ekki vera tómt, verður að vera netfang
  * Normalísera sem netfang
* Notendanafn
  * Má ekki vera tómt
  * Má ekki vera til nú þegar (fletta verður upp í notendagrunni)
* Lykilorð
  * Verður að vera a.m.k. 8 stafir
  * Verður að vera staðfest (þ.e.a.s. tveir lykilorða reitir)

Eftir skráningu skal senda á þakkarsíðu sem bíður notanda upp á að skrá sig inn.

Nota skal [`bcrypt`](https://github.com/kelektiv/node.bcrypt.js) fyrir geymslu lykilorða. Ekki skal geyma lykilorðin sjálf sem texta neinstaðar.

Eftir innskráningu mega notendur skoða umsóknir, ef reynt er að skoða umsóknir án þess að vera innskráður notandi er notandi sendur á `/login`.

Á umsóknarsíðu mega þeir notendur sem eru `admin` (boolean gildi geymt á notanda) eyða umsókn. Allir notendur mega „vinna umsókn“.

Ný síða sýnir alla notendur á `/admin`. Notendanöfn, nöfn og netföng eru sýnd. Ef notandi er `admin` má viðkomandi breyta `admin` stöðu allra notanda. Það er gert með því að haka í checkbox og senda form. Athugið að hægt er að fá fylki af gildum til baka úr formi með því að gefa þeim `name` sem endar á `[]`, t.d. `name="admin[]"`. Eftir að notendur eru uppfærðir er farið aftur á `/admin`. Þessa virkni skal útfæra í `admin.js`.

Í minni skjám skal notendaumsjónarsíða sýna töflu með láréttri skrunstiku, sjá skjáskot.

## Gagnagrunnur

Sama gildir um gagnagrunn [og í verkefni 2](https://github.com/vefforritun/vef2-2019-v2#%C3%BAtlit).

Leyfilegt er að setja upp virkni fyrir notendur í annari skrá en `db.js`.

### Prufugögn

Í `insert.sql` skal setja inn [sömu gögn og í verkefni 2](https://github.com/vefforritun/vef2-2019-v2#prufug%C3%B6gn) ásamt því að búa til eftirfarandi notendur:

Notendanafn | Lykilorð | Nafn | Netfang | Admin?
------------|----------|------|---------|-------
admin | `asdfasdf` | Admin | admin@example.org | Já
nn | `12341234` | Nafnlaus | nn@example.org | Nei

## Heroku

Verkefnið skal keyra á Heroku með allri þeirri virkni sem hér er lýst ásamt prufugögnum.

## Annað

Notast skal við EJS template til að útbúa HTML.

Setja skal upp villumeðhöndlun fyrir almennar villur og ef beðið er um slóð sem ekki er til (404). Skilaboð skulu birt notanda um hvað gerðist („Síða fannst ekki“ – „Villa kom upp“)..

Öll dependency skulu skráð í `package.json`.

`npm start` skal keyra upp vefþjón á localhost porti 3000.

## Git og GitHub

Verkefni þetta er sett fyrir á GitHub og almennt ætti að skila því úr einka (private) repo nemanda. Nemendur geta fengið gjaldfrjálsan aðgang að einkarepos á meðan námi stendur, sjá https://education.github.com/.

Til að byrja er hægt að afrita þetta repo og bæta við á sínu eigin:

```bash
> git clone https://github.com/vefforritun/vef2-2019-v3.git
> cd vef2-2019-v3
> git remote remove origin # fjarlægja remote sem verkefni er í
> git remote add origin <slóð á repo> # bæta við í þínu repo
> git push
```

## Mat

* 10% – Snyrtilegur kóði, engar villur þegar `npm test` er keyrt
* 10% – Útlit uppsett eftir forskrift, merkingarfræðilegt HTML og snyrtilegt CSS
* 10% – Leiðarkerfi útfært
* 20% – Verkefni sett upp á Heroku
* 50% – Notendaumsjón

## Sett fyrir

Verkefni sett fyrir á Uglu sunnudaginn 10. febrúar 2019.

## Skil

Skila skal undir „Verkefni og hlutaprófa“ á Uglu í seinasta lagi fyrir lok dags laugardaginn 23. febrúar 2019.

Skilaboð skulu innihalda:

* Slóð á GitHub repo fyrir verkefni, og dæmatímakennurum skal hafa verið boðið í repo (sjá leiðbeiningar). Notendanöfn þeirra eru `freyrdanielsson`, `gunkol`, `kth130`
* Slóð á verkefni keyrandi á Heroku

## Einkunn

Sett verða fyrir sex minni verkefni þar sem fimm bestu gilda 6% hvert, samtals 30% af lokaeinkunn.

Sett verða fyrir tvö hópverkefni þar sem hvort um sig gildir 15%, samtals 30% af lokaeinkunn.

Verkefnahluti gildir 60% og lokapróf gildir 40%. Ná verður *bæði* verkefnahluta og lokaprófi með lágmarkseinkunn 5.

---

> Útgáfa 0.2

| Útgáfa | Lýsing                                    |
|--------|-------------------------------------------|
| 0.1    | Fyrsta útgáfa                             |
| 0.2    | Bæta við hvað gerist eftir nýskráningu    |
