import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const charities = [
  {
    name: "Golf For Good Foundation",
    description: "Supporting youth golf programs and grassroots development across the UK.",
    fullDescription:
      "The Golf For Good Foundation is dedicated to making golf accessible to young people from all backgrounds. Through subsidised coaching, equipment grants, and partnerships with local clubs, we build the next generation of golfers while teaching life skills like discipline, sportsmanship, and perseverance.",
    imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&h=500&fit=crop",
    causeType: "Youth Development",
    totalContributions: 12450,
    goalAmount: 20000,
    upcomingEvents: [
      { title: "Summer Youth Golf Day", date: "June 15, 2026", location: "Royal St George's, Kent" },
      { title: "Charity Pro-Am", date: "August 8, 2026", location: "Wentworth Club, Surrey" },
    ],
  },
  {
    name: "Fairway Future Trust",
    description: "Building accessible golf facilities in underserved communities.",
    fullDescription:
      "Fairway Future Trust works to break down barriers to golf by funding the construction of public-access golf facilities in areas where the sport has traditionally been inaccessible. We believe everyone deserves a fairway.",
    imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&h=500&fit=crop",
    causeType: "Community",
    totalContributions: 8300,
    goalAmount: 15000,
    upcomingEvents: [
      { title: "Community Open Day", date: "July 20, 2026", location: "Manchester Community Links" },
    ],
  },
  {
    name: "Green Hearts Initiative",
    description: "Environmental conservation through sustainable golf course management.",
    fullDescription:
      "Green Hearts Initiative partners with clubs to adopt sustainable course practices, water conservation, and native habitat restoration while educating local communities on environmental stewardship.",
    imageUrl: "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=1200&h=500&fit=crop",
    causeType: "Environment",
    totalContributions: 15200,
    goalAmount: 25000,
    upcomingEvents: [],
  },
  {
    name: "Youth On Course UK",
    description: "Making golf affordable for young people with subsidised green fees.",
    fullDescription:
      "Youth On Course UK subsidises green fees and provides coaching bursaries for young golfers, opening doors to mentorship and competition pathways across the country.",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=500&fit=crop",
    causeType: "Youth Development",
    totalContributions: 22100,
    goalAmount: 30000,
    upcomingEvents: [],
  },
];

const run = async () => {
  for (const charity of charities) {
    const existing = await prisma.charity.findFirst({ where: { name: charity.name } });
    if (existing) {
      await prisma.charity.update({
        where: { id: existing.id },
        data: {
          description: charity.description,
          fullDescription: charity.fullDescription,
          imageUrl: charity.imageUrl,
          causeType: charity.causeType,
          totalContributions: charity.totalContributions,
          goalAmount: charity.goalAmount,
          upcomingEvents: charity.upcomingEvents,
        },
      });
    } else {
      await prisma.charity.create({
        data: {
          name: charity.name,
          description: charity.description,
          fullDescription: charity.fullDescription,
          imageUrl: charity.imageUrl,
          causeType: charity.causeType,
          totalContributions: charity.totalContributions,
          goalAmount: charity.goalAmount,
          upcomingEvents: charity.upcomingEvents,
        },
      });
    }
  }
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
