# Organizator de cantari - TODO

## Directia stabilita

- [x] Aplicatia este initial pentru un singur utilizator.
- [x] Codul va putea fi publicat pe Git, dar datele si textele personale raman private.
- [x] Aplicatia trebuie sa functioneze pe calculator si telefon.
- [x] Cantarile trebuie sa fie disponibile offline in timpul programului.
- [x] Fiecare cantare contine text si acorduri.
- [x] Cantarile pot avea mai multe categorii/etichete.
- [x] Vom pastra separat programul planificat si ce s-a cantat efectiv.
- [x] Sincronizarea va fi local-first, fara suprascrierea intregii baze de date.

## Etapa 0 - decizii scurte

- [ ] Alegem numele provizoriu al aplicatiei.
- [ ] Alegem notatia principala pentru acorduri: internationala (`C, D, E`) sau romaneasca (`Do, Re, Mi`).
- [ ] Confirmam ca `Pian +3` inseamna transpunerea pianului cu 3 semitonuri.
- [ ] Notam tehnologiile cu care lucreaza deja autorul proiectului.
- [ ] Alegem stack-ul impreuna, pornind de la tehnologiile deja cunoscute.
- [ ] Verificam ca stack-ul ales poate oferi PWA, stocare locala, API si SQLite.
- [ ] Documentam decizia si motivele in `README.md`.

## Etapa 1 - scheletul proiectului

- [ ] Initializam repository-ul Git.
- [ ] Cream aplicatia web folosind stack-ul ales.
- [ ] Adaugam reguli `.gitignore` pentru baze de date, backupuri si configurari locale.
- [ ] Adaugam structura de baza: `songs`, `programs`, `history`, `settings`.
- [ ] Adaugam o pagina principala simpla, optimizata pentru telefon si calculator.
- [ ] Verificam ca proiectul porneste local si ca testele de baza ruleaza.

Rezultat: aplicatia se deschide, are navigare de baza si nu contine inca date reale.

## Etapa 2 - modelul unei cantari

- [ ] Definim modelul `Song` cu campurile:
  - `id` (UUID);
  - `title`;
  - `alternateTitle` optional;
  - `content` (text cu acorduri in stil ChordPro);
  - `baseKey`;
  - `pianoTranspose`;
  - `author`, `source`, `bookNumber` optionale;
  - `notes`;
  - `favorite`, `archived`;
  - `createdAt`, `updatedAt`, `version`, `deletedAt`.
- [ ] Definim categoriile si relatia unei cantari cu mai multe categorii.
- [ ] Cream cateva cantari demonstrative care nu contin texte protejate.
- [ ] Adaugam validare pentru titlu, tonalitate si continut.

Rezultat: avem o structura stabila, pregatita si pentru sincronizare ulterioara.

## Etapa 3 - biblioteca de cantari

- [ ] Afisam lista tuturor cantarilor.
- [ ] Adaugam cautare dupa titlu, text si acorduri.
- [ ] Adaugam filtrare dupa categorie, favorite si arhivate.
- [ ] Cream formularul pentru adaugarea unei cantari.
- [ ] Cream formularul pentru editare si arhivare.
- [ ] Adaugam categorii direct din editorul cantarii.
- [ ] Adaugam confirmare si protectie impotriva pierderii modificarilor nesalvate.

Rezultat: putem inlocui grupul WhatsApp ca loc de pastrare si cautare a cantarilor.

## Etapa 4 - acorduri si modul de cantare

- [ ] Implementam citirea acordurilor scrise intre paranteze, de exemplu `[G]Text`.
- [ ] Afisam acordurile deasupra silabei potrivite.
- [ ] Adaugam moduri de afisare: `Text + acorduri` si `Doar text`.
- [ ] Adaugam reglarea marimii textului.
- [ ] Adaugam ecran complet si mentinerea ecranului aprins, unde browserul permite.
- [ ] Afisam clar tonalitatea si nota pentru pian, de exemplu `Pian +3`.
- [ ] Scriem teste pentru acorduri simple si complexe: `Am`, `F#m7`, `Bb`, `G/B`, `Dsus4`.
- [ ] Pregatim parserul pentru transpunere automata, fara a include obligatoriu functia in prima versiune.

Rezultat: o cantare poate fi folosita practic in timpul programului.

## Etapa 5 - planificarea programului

- [ ] Cream un program cu titlu, data, ora si observatii.
- [ ] Adaugam cantari din biblioteca in program.
- [ ] Schimbam ordinea cantarilor prin butoane si/sau drag-and-drop.
- [ ] Permitem adaugarea aceleiasi cantari cu o tonalitate specifica programului.
- [ ] Afisam data ultimei folosiri in momentul alegerii unei cantari.
- [ ] Adaugam modul `Incepe programul`, cu navigare Inapoi/Urmatoarea.
- [ ] Permitem introducerea rapida a unei cantari neplanificate.

Rezultat: programul poate fi pregatit din timp si urmarit de pe telefon.

## Etapa 6 - istoric

- [ ] Marcam separat cantarile planificate si cele cantate efectiv.
- [ ] Salvam fiecare interpretare ca eveniment separat, fara a suprascrie alte date.
- [ ] Afisam ultima data cand a fost cantata o cantare.
- [ ] Afisam toate datele la care a fost cantata.
- [ ] Adaugam filtre pe perioada si categorie.
- [ ] Adaugam statistici simple: numar de folosiri si cantari nefolosite recent.

Rezultat: putem evita repetitiile si putem planifica pe baza istoricului real.

## Etapa 7 - instalare PWA si offline

- [ ] Adaugam manifest, iconite si instalare pe telefon/calculator.
- [ ] Salvam biblioteca si programele in IndexedDB.
- [ ] Facem interfata principala disponibila fara internet.
- [ ] Afisam clar starea: online, offline, modificari nesincronizate.
- [ ] Testam inchiderea browserului, repornirea telefonului si lipsa conexiunii.

Rezultat: aplicatia functioneaza la biserica fara internet si fara calculator pornit.

## Etapa 8 - API local si SQLite

- [ ] Cream serverul local care ruleaza pe calculator.
- [ ] Cream schema SQLite si migrarile bazei de date.
- [ ] Cream endpointuri pentru cantari, categorii, programe, istoric si sincronizare.
- [ ] Restrictionam accesul la reteaua locala si folosim un token al dispozitivului.
- [ ] Afisam un cod QR pentru conectarea telefonului la calculator.
- [ ] Nu expunem portul API direct pe internet.

Rezultat: calculatorul devine sursa principala de date si poate comunica sigur cu telefonul in reteaua locala.

## Etapa 9 - sincronizare fara suprascrieri

- [ ] Fiecare dispozitiv pastreaza un jurnal de modificari.
- [ ] Implementam sincronizarea `push`, apoi `pull`, de la ultima sincronizare.
- [ ] Folosim `version` pentru detectarea modificarilor concurente.
- [ ] Nu stergem fizic imediat inregistrarile; folosim `deletedAt` pentru propagarea stergerilor.
- [ ] Combinam automat evenimentele de istoric, fiind date de tip adaugare.
- [ ] Daca aceeasi cantare a fost editata pe ambele dispozitive, pastram ambele variante si cerem alegerea utilizatorului.
- [ ] Adaugam pagina `Conflicte de rezolvat`.
- [ ] Testam scenarii cu telefonul offline si modificari pe ambele dispozitive.

Rezultat: modificarile se sincronizeaza in ambele sensuri fara pierdere silentioasa de date.

## Etapa 10 - backup, import si publicare

- [ ] Exportam toate datele intr-o arhiva locala.
- [ ] Importam un backup cu validare si previzualizare.
- [ ] Facem backupuri SQLite automate si pastram mai multe versiuni.
- [ ] Adaugam export individual al cantarilor intr-un format portabil.
- [ ] Documentam instalarea pe Windows si telefon.
- [ ] Adaugam licenta pentru cod si date demonstrative.
- [ ] Verificam ca textele personale si baza reala nu ajung in repository.
- [ ] Publicam repository-ul numai dupa verificarea secretelor si a datelor private.

## Mai tarziu, dupa prima versiune utilizabila

- [ ] Transpunere automata a acordurilor.
- [ ] Conversie intre `C, D, E` si `Do, Re, Mi`.
- [ ] Preferinte separate pentru pian si chitara.
- [ ] Acces securizat din afara retelei locale prin VPN privat.
- [ ] Pachet de instalare simplificat pentru alti utilizatori.
- [ ] Colaborare intre mai multe persoane, numai daca apare nevoia.

## Urmatoarele 5 actiuni concrete

1. [ ] Confirmam notatia acordurilor si sensul campului `Pian +3`.
2. [ ] Alegem un nume provizoriu.
3. [ ] Initializam proiectul in stack-ul ales si repository-ul Git.
4. [ ] Implementam modelul `Song` pregatit pentru sincronizare.
5. [ ] Construim biblioteca si editorul de cantari inaintea API-ului de sincronizare.
