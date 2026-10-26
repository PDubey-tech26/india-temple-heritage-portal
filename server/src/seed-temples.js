import "dotenv/config";
import { pool } from "./db.js";

const temples = [
  {
    name: "Kashi Vishwanath Temple",
    slug: "kashi-vishwanath-temple",
    city: "Varanasi",
    state: "Uttar Pradesh",
    deity: "Lord Shiva",
    category: "Jyotirlinga",
    image_url:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Kashi%20Vishwanath%20Temple%20in%20Varanasi.jpg?width=1200",
    description:
      "One of the most revered Shiva temples, located in the sacred city of Varanasi.",
    history:
      "Kashi Vishwanath is an important pilgrimage destination associated with Lord Shiva.",
    timings: "Check official temple timings before visiting.",
    bestTime: "Check local weather and festival schedules before planning."
  },
  {
    name: "Shri Ram Janmabhoomi Mandir",
    slug: "shri-ram-janmabhoomi-mandir",
    city: "Ayodhya",
    state: "Uttar Pradesh",
    deity: "Lord Ram",
    category: "Heritage Temple",
    image_url:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Ram%20Mandir%2C%20Ayodhya.png?width=1200",
    description:
      "A major pilgrimage destination associated with the life and tradition of Lord Ram.",
    history:
      "Ayodhya holds an important place in Hindu religious tradition.",
    timings: "Check official temple announcements before visiting.",
    bestTime: "Plan ahead during festivals and peak pilgrimage periods."
  },
  {
    name: "Banke Bihari Temple",
    slug: "banke-bihari-temple",
    city: "Vrindavan",
    state: "Uttar Pradesh",
    deity: "Lord Krishna",
    category: "Krishna Temple",
    image_url:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Banke%20Bihari%20Temple.jpg?width=1200",
    description:
      "A famous Krishna temple in Vrindavan known for its devotional traditions.",
    history:
      "The temple is an important center of Krishna devotion in the Braj region.",
    timings: "Darshan timings can vary; verify locally.",
    bestTime: "Check festival dates and crowd conditions."
  },
  {
    name: "Prem Mandir",
    slug: "prem-mandir",
    city: "Vrindavan",
    state: "Uttar Pradesh",
    deity: "Radha Krishna",
    category: "Krishna Temple",
    image_url:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Prem%20Mandir%20Vrindavan.jpg?width=1200",
    description:
      "A marble temple in Vrindavan known for its architecture and devotional atmosphere.",
    history:
      "Prem Mandir is dedicated to the divine love of Radha Krishna and the traditions of Braj.",
    timings: "Check current visiting hours before travelling.",
    bestTime: "Consider evening visits and seasonal crowd conditions."
  },
  {
    name: "Shri Krishna Janmasthan",
    slug: "shri-krishna-janmasthan",
    city: "Mathura",
    state: "Uttar Pradesh",
    deity: "Lord Krishna",
    category: "Krishna Temple",
    image_url:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Krishna%20Janmasthan%20Mathura.jpg?width=1200",
    description:
      "A major religious destination in Mathura associated with the birth of Lord Krishna.",
    history:
      "Mathura is an important city in the religious traditions surrounding Lord Krishna.",
    timings: "Verify current darshan timings and entry instructions.",
    bestTime: "Plan carefully around Janmashtami and other festivals."
  },
  {
    name: "Kedarnath Temple",
    slug: "kedarnath-temple",
    city: "Kedarnath",
    state: "Uttarakhand",
    deity: "Lord Shiva",
    category: "Jyotirlinga",
    image_url:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Kedarnath%20Temple.jpg?width=1200",
    description:
      "A Himalayan pilgrimage destination associated with Lord Shiva.",
    history:
      "Kedarnath is one of the prominent pilgrimage sites in the Himalayan region.",
    timings: "Check official opening dates and darshan schedules.",
    bestTime: "Travel only after checking weather and route advisories."
  },
  {
    name: "Badrinath Temple",
    slug: "badrinath-temple",
    city: "Badrinath",
    state: "Uttarakhand",
    deity: "Lord Vishnu",
    category: "Char Dham",
    image_url:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Badrinath%20Temple.jpg?width=1200",
    description:
      "A renowned Himalayan pilgrimage site dedicated to Lord Vishnu.",
    history:
      "Badrinath is an important destination in the Char Dham pilgrimage tradition.",
    timings: "Check official opening dates and darshan timings.",
    bestTime: "Check road conditions and weather before travelling."
  },
  {
    name: "Jagannath Temple",
    slug: "jagannath-temple-puri",
    city: "Puri",
    state: "Odisha",
    deity: "Lord Jagannath",
    category: "Char Dham",
    image_url:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Jagannath%20Temple%20Puri.jpg?width=1200",
    description:
      "A historic pilgrimage center renowned for its worship traditions and Rath Yatra.",
    history:
      "Jagannath Temple is central to the religious and cultural life of Puri.",
    timings: "Check official temple schedules and entry requirements.",
    bestTime: "Allow extra time during major festivals."
  },
  {
    name: "Meenakshi Amman Temple",
    slug: "meenakshi-amman-temple",
    city: "Madurai",
    state: "Tamil Nadu",
    deity: "Goddess Meenakshi and Lord Sundareswarar",
    category: "Shakti and Heritage",
    image_url:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Meenakshi%20Temple%2C%20Madurai%2C%20India.jpg?width=1200",
    description:
      "A celebrated temple complex known for its richly decorated gopurams and sculptures.",
    history:
      "Meenakshi Amman Temple is a major religious and cultural landmark in Madurai.",
    timings: "Verify current temple timings before travelling.",
    bestTime: "Consider local weather and festival schedules."
  },
  {
    name: "Somnath Temple",
    slug: "somnath-temple",
    city: "Prabhas Patan",
    state: "Gujarat",
    deity: "Lord Shiva",
    category: "Jyotirlinga",
    image_url:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Somnath%20Temple.JPG?width=1200",
    description:
      "A prominent coastal pilgrimage destination associated with Lord Shiva.",
    history:
      "Somnath is widely recognized as one of the twelve Jyotirlinga pilgrimage sites.",
    timings: "Check the official temple schedule before visiting.",
    bestTime: "Review weather and festival dates when planning."
  }
];

async function seedTemples() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const temple of temples) {
      const result = await client.query(
        `INSERT INTO temples (
          name,
          slug,
          city,
          state,
          address,
          deity,
          category,
          image_url,
          description,
          history,
          darshan_timings,
          best_time,
          status
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13
        )
        ON CONFLICT (slug) DO NOTHING`,
        [
          temple.name,
          temple.slug,
          temple.city,
          temple.state,
          `${temple.city}, ${temple.state}`,
          temple.deity,
          temple.category,
          temple.image_url,
          temple.description,
          temple.history,
          temple.timings,
          temple.bestTime,
          "approved"
        ]
      );

      console.log(
        `${temple.name}: ${
          result.rowCount === 1 ? "INSERTED" : "ALREADY EXISTS"
        }`
      );
    }

    await client.query("COMMIT");

    const summary = await client.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (
          WHERE status = 'approved'
        )::int AS approved
      FROM temples
    `);

    console.log("\nSeed completed successfully.");
    console.log("Database summary:", summary.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seedTemples().catch((error) => {
  console.error("Unexpected seed error:", error.message);
  process.exitCode = 1;
});