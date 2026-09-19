export default {
  url: "https://twoja-domena.example", // no trailing slash
  email: "kontakt@twoja-domena.example",
  updated: "2026-09-19",

  programs: {
    zoliborz: {
      label: "Dla mieszkańców Żoliborza 60+",
      url: "https://zoliborz.um.warszawa.pl/waw/opszoliborz/-/kawa-dla-seniora",
      isVisible: false,
    },
  },

  cities: {
    Warszawa: [
      {
        name: "Muszelka",
        promo: "10zł",
        street: "Zwycięzców 55, Saska Kępa",
        how: "Kawa dla zasłużonych 65+ w menu",
      },
      {
        name: "Restauracja Via Suzina",
        promo:
          "Kawa lub herbata za 1 zł, dodatkowo 50% zniżki na dowolny deser",
        street: "ul. Suzina 8",
        when: "Od poniedziałku do piątku, 12:00–17:00",
        program: "zoliborz",
      },
      {
        name: "Kawiarnia Fawory",
        promo: "Kawa za 5 zł, herbata za 3 zł, dodatkowo 30% zniżki na ciasto",
        street: "ul. Mickiewicza 21 lok. 2",
        when: "Od poniedziałku do piątku, 14:00–17:00",
        program: "zoliborz",
      },
      {
        name: "Ulica Baśniowa",
        promo: "Kawa lub herbata za 3 zł",
        street: "Al. Wojska Polskiego 41",
        when: "Od poniedziałku do piątku, 11:00–14:00",
        program: "zoliborz",
      },
      {
        name: "Prochownia Żoliborz",
        promo: "Kawa za 4 zł",
        street: "ul. Krasińskiego 15",
        when: "Od poniedziałku do piątku, 10:00–12:00",
        program: "zoliborz",
      },
      {
        name: "Secret Life Cafe",
        promo: "Kawa, herbata lub napary za 1 zł",
        street: "ul. Słowackiego 15/19",
        when: "Od poniedziałku do piątku, 8:00–21:00",
        program: "zoliborz",
      },
      {
        name: "Kawiarnia Kofifi",
        promo: "Kawa lub herbata za 6 zł, ciasto za 10 zł",
        street: "ul. Mierosławskiego 19",
        when: "Od poniedziałku do piątku, 12:00–16:00",
        program: "zoliborz",
      },
      {
        name: "Onda Cafe",
        promo:
          "Kawa czarna za 6 zł, cappuccino za 8 zł, dodatkowo 30% zniżki na wszystko w lokalu",
        street: "ul. Przasnyska 6a",
        when: "Od poniedziałku do piątku, 7:30–19:00",
        program: "zoliborz",
      },
      {
        name: "Salto Bar",
        promo:
          "Kawa czarna za 6 zł, kawa z mlekiem lub mlekiem roślinnym za 8 zł, herbata za 6 zł, dodatkowo 15% rabatu na słodkie wypieki",
        street: "ul. Sady Żoliborskie 4",
        when: "Od poniedziałku do piątku, 9:00–16:00",
        program: "zoliborz",
      },
      {
        name: "Kotłownia",
        promo:
          "Kawa lub herbata za 1 zł, dodatkowo 50% zniżki na dowolne danie obiadowe",
        street: "ul. Suzina 8",
        when: "Od poniedziałku do piątku, 13:00–17:00",
        program: "zoliborz",
      },
    ],
  },
};
