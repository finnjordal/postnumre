postnumre
======

Et web API til at udstille PostDanmarks postnumre.

eksempel
=======

Se [postnumre](http://postnumre.oiorest.dk)


install
=======

git clone git://github.com/finnjordal/postnumre.git

cd postnumre

npm install -d


Anvender Node v0.6.7 og MongoDB 2.0.

MongoDB indeholder en database ved navn postdanmark, som igen indeholder en collection ved navn brugere med et objekt med properties navn og password, der udpeger sitets administrator - alt i klartekst :) 

test
====

cd postnumre/test

mocha unittest.js

license
=======

MIT/X11