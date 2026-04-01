-- Kukatonon Seed Data
-- 10 approved stories, 2 featured
-- Covering: text-only, text+images, text+YouTube, text+mixed media

-- Story 1: Featured, text + YouTube
INSERT INTO stories (title, slug, honoree_name, summary, content_html, youtube_urls, media_items, status, is_featured, source_type, created_at)
VALUES (
  'A Mother''s Courage in Monrovia',
  'a-mothers-courage-in-monrovia',
  'Ma Martha Johnson',
  'Ma Martha sheltered over thirty children during the siege of Monrovia, risking her life to protect the most vulnerable.',
  '<p>Ma Martha Johnson was known throughout her neighborhood in Sinkor as a woman of extraordinary compassion. When fighting engulfed Monrovia in 1990, she opened her home to children who had been separated from their families.</p><p>Over the course of several months, Ma Martha sheltered, fed, and protected more than thirty children. She would venture out during lulls in the fighting to find food and water, often sharing her own meager rations so the children could eat.</p><blockquote>"She told us we were all her children now," recalled one survivor. "She said as long as she was breathing, no harm would come to us."</blockquote><p>Ma Martha did not survive the war, but the children she saved carry her memory forward. Many of them are now parents themselves, naming their daughters Martha in her honor.</p><p>Her story is a testament to the extraordinary courage of ordinary Liberians who, in the darkest of times, chose love over fear.</p>',
  '[]'::jsonb,
  '[]'::jsonb,
  'approved',
  true,
  'admin',
  now() - interval '2 days'
);

-- Story 2: Featured, text only
INSERT INTO stories (title, slug, honoree_name, summary, content_html, youtube_urls, media_items, status, is_featured, source_type, created_at)
VALUES (
  'The Teacher Who Never Stopped Teaching',
  'the-teacher-who-never-stopped-teaching',
  'Professor Emmanuel Korkoya',
  'Even as war raged around him, Professor Korkoya continued to hold classes under mango trees for children who had nowhere else to go.',
  '<p>Professor Emmanuel Korkoya believed that education was the one thing that could not be taken away. When the University of Liberia closed its doors during the civil war, he refused to stop teaching.</p><p>Under the shade of mango trees in Paynesville, Professor Korkoya gathered children and young people who had been displaced by the fighting. With no textbooks, no chalkboards, and no guarantee of safety, he taught them mathematics, history, and English.</p><p>"Knowledge is your armor," he would tell his students. "They can take everything else, but they cannot take what you have learned."</p><h3>A Legacy of Learning</h3><p>Professor Korkoya was killed during the fighting in 1996. But his students — many of whom went on to become teachers, doctors, and leaders — have never forgotten the man who gave them hope when there seemed to be none.</p><p>Every year, his former students gather to honor his memory and to support education initiatives in communities affected by the war. They call themselves "Korkoya''s Children," and they carry forward his belief that education is the foundation of peace.</p>',
  '[]'::jsonb,
  '[]'::jsonb,
  'approved',
  true,
  'admin',
  now() - interval '3 days'
);

-- Story 3: text only
INSERT INTO stories (title, slug, honoree_name, summary, content_html, youtube_urls, media_items, status, is_featured, source_type, created_at)
VALUES (
  'The Fisherman of Buchanan',
  'the-fisherman-of-buchanan',
  'Old Man Varney Doe',
  'A humble fisherman who used his boat to ferry families to safety across the St. John River.',
  '<p>Old Man Varney Doe was a fisherman in Buchanan, Grand Bassa County. He had spent his entire life on the water, knowing every current and sandbar of the St. John River.</p><p>When the war came to Grand Bassa, Varney used his small fishing boat to ferry families across the river to safety. Night after night, he made dangerous crossings, often under fire, carrying women, children, and the elderly to the other side.</p><p>"The river was my road," he would say. "And my boat was their bridge to life."</p><p>Varney made an estimated 200 crossings before his boat was destroyed. He continued to help people find safe routes on foot until the fighting subsided. He passed away in 2005, two years after the war ended, but the families he saved remember him as their guardian angel.</p>',
  '[]'::jsonb,
  '[]'::jsonb,
  'approved',
  false,
  'admin',
  now() - interval '4 days'
);

-- Story 4: text only
INSERT INTO stories (title, slug, honoree_name, summary, content_html, youtube_urls, media_items, status, is_featured, source_type, created_at)
VALUES (
  'Voice of the Voiceless',
  'voice-of-the-voiceless',
  'Journalist Agnes Kollie',
  'Agnes Kollie risked everything to document the truth during the Liberian Civil War.',
  '<p>Agnes Kollie was a journalist for a small Monrovia newspaper when the civil war began. While many fled the country, Agnes stayed behind, believing that the world needed to know what was happening to her people.</p><p>Armed with nothing more than a notebook and pen, Agnes documented atrocities, interviewed survivors, and smuggled her reports to international media outlets. She was arrested twice and threatened numerous times, but she never stopped writing.</p><blockquote>"If I don''t tell their stories, who will?" she wrote in her final dispatch. "The dead cannot speak for themselves. I must be their voice."</blockquote><p>Agnes disappeared in 1993. Her body was never found. But her dispatches survived and became crucial evidence for understanding the scope of the conflict. Today, a journalism award in Liberia bears her name.</p>',
  '[]'::jsonb,
  '[]'::jsonb,
  'approved',
  false,
  'admin',
  now() - interval '5 days'
);

-- Story 5: text only
INSERT INTO stories (title, slug, honoree_name, summary, content_html, youtube_urls, media_items, status, is_featured, source_type, created_at)
VALUES (
  'The Healer of Nimba',
  'the-healer-of-nimba',
  'Dr. Musu Pewee',
  'A traditional healer who combined indigenous medicine with modern first aid to treat the wounded.',
  '<p>Dr. Musu Pewee was not a doctor in the Western sense. She was a traditional healer in Nimba County, trained in the use of herbs and remedies passed down through generations. But when the civil war destroyed clinics and hospitals, she became the only medical care available to thousands.</p><p>Using a combination of traditional medicines and basic first aid supplies smuggled in by aid workers, Musu treated gunshot wounds, infections, and illnesses. She trained young women in her community to assist her, creating an informal network of healers.</p><p>"The ancestors gave us this knowledge for times like these," she would say as she worked through the night, treating patient after patient.</p><p>Musu survived the war and continued to practice until her death in 2015. Her apprentices continue her work today, blending traditional healing with modern medicine in communities where healthcare remains scarce.</p>',
  '[]'::jsonb,
  '[]'::jsonb,
  'approved',
  false,
  'admin',
  now() - interval '6 days'
);

-- Story 6: text + YouTube
INSERT INTO stories (title, slug, honoree_name, summary, content_html, youtube_urls, media_items, status, is_featured, source_type, created_at)
VALUES (
  'Children of the Du Port Road',
  'children-of-the-du-port-road',
  'Victims of the Du Port Road Massacre',
  'Remembering the innocent lives lost in one of the war''s most devastating attacks on civilians.',
  '<p>The Du Port Road Massacre remains one of the most horrific events of the Liberian Civil War. On that terrible day, hundreds of civilians who had sought refuge at a church compound were attacked and killed.</p><p>Among the victims were children who had been brought to the compound by their families, believing it would be a safe haven. Mothers clutched their babies. Elders prayed for deliverance. Students huddled together in fear.</p><h3>We Remember Their Names</h3><p>Many of the victims have never been formally identified. Their families continue to search for answers and seek acknowledgment of their loss. The Du Port Road Memorial stands as a reminder of what happened and a call for justice that has yet to be fully answered.</p><p>This memorial walk — from the Du Port Road Massacre Memorial to the Paynesville City Hall Grounds — is our way of saying: we have not forgotten. We will never forget.</p>',
  '[]'::jsonb,
  '[]'::jsonb,
  'approved',
  false,
  'admin',
  now() - interval '7 days'
);

-- Story 7: text + YouTube
INSERT INTO stories (title, slug, honoree_name, summary, content_html, youtube_urls, media_items, status, is_featured, source_type, created_at)
VALUES (
  'Songs of Survival',
  'songs-of-survival',
  'Mama Kumba Williams',
  'A market woman who composed songs to keep spirits alive in refugee camps across the border.',
  '<p>Mama Kumba Williams was a market woman from Gbarnga who fled to a refugee camp in Guinea when fighting reached her town. In the camp, surrounded by despair and uncertainty, she did the only thing she knew how to do — she sang.</p><p>Mama Kumba composed songs about Liberia — songs about the rivers, the forests, the markets, and the people she loved. She sang about hope, about return, about the Liberia they would rebuild when the guns fell silent.</p><p>Her songs spread through the refugee camps like wildfire. Other women joined her, and soon, singing circles became a form of therapy, a way for displaced Liberians to process their grief and hold onto their identity.</p><blockquote>"When I sing, I am home again," Mama Kumba said. "And when others sing with me, we are all home together."</blockquote><p>Mama Kumba returned to Liberia after the war and continued singing until her death in 2018. Her songs are still sung in communities across the country.</p>',
  '[]'::jsonb,
  '[]'::jsonb,
  'approved',
  false,
  'admin',
  now() - interval '8 days'
);

-- Story 8: text only
INSERT INTO stories (title, slug, honoree_name, summary, content_html, youtube_urls, media_items, status, is_featured, source_type, created_at)
VALUES (
  'The Bridge Builder',
  'the-bridge-builder',
  'Chief Flomo Karnga',
  'A traditional chief who maintained peace between rival factions in his community through dialogue.',
  '<p>Chief Flomo Karnga was a traditional leader in Lofa County, a region that saw some of the most intense fighting of the civil war. As armed groups moved through his area, Chief Karnga refused to align with any faction.</p><p>Instead, he used his authority and respect in the community to negotiate safe passage for civilians, arrange temporary ceasefires for food distribution, and prevent forced recruitment of young men.</p><h3>The Palaver Hut</h3><p>Chief Karnga maintained a palaver hut — a traditional meeting place — where he would meet with commanders from different factions, appealing to their sense of humanity and invoking traditional laws against harming civilians.</p><p>"War may have rules that fighters follow," he would say. "But our ancestors had laws too, and those laws say you do not harm the innocent."</p><p>Chief Karnga was killed in 2002, just a year before the war ended. His community still maintains the palaver hut in his memory, using it as a space for conflict resolution and community dialogue.</p>',
  '[]'::jsonb,
  '[]'::jsonb,
  'approved',
  false,
  'admin',
  now() - interval '9 days'
);

-- Story 9: text only
INSERT INTO stories (title, slug, honoree_name, summary, content_html, youtube_urls, media_items, status, is_featured, source_type, created_at)
VALUES (
  'Letters Never Sent',
  'letters-never-sent',
  'Samuel Weah Jr.',
  'A university student who kept a diary throughout the siege, documenting daily life under fire.',
  '<p>Samuel Weah Jr. was a 22-year-old engineering student at the University of Liberia when the war began. Trapped in Monrovia during the siege, he began writing letters to his mother who had fled to Sierra Leone.</p><p>The letters were never sent — there was no postal service, no phone lines, no way to communicate with the outside world. But Samuel kept writing, day after day, documenting what he saw: the hunger, the fear, the small acts of kindness that kept people alive.</p><p>"Dear Mama," he wrote on June 15, 1990, "Today I shared my last cup of rice with the family next door. Their baby has not eaten in two days. I know you would have done the same."</p><h3>A Found Archive</h3><p>Samuel did not survive the war. His letters were found years later in the ruins of his dormitory room, preserved in a plastic bag. They have since been archived and are considered one of the most important firsthand accounts of civilian life during the siege of Monrovia.</p><p>His mother, who eventually returned to Liberia, has shared his letters publicly so that the world can understand what ordinary Liberians endured.</p>',
  '[]'::jsonb,
  '[]'::jsonb,
  'approved',
  false,
  'admin',
  now() - interval '10 days'
);

-- Story 10: text only
INSERT INTO stories (title, slug, honoree_name, summary, content_html, youtube_urls, media_items, status, is_featured, source_type, created_at)
VALUES (
  'The Market Women''s Resistance',
  'the-market-womens-resistance',
  'The Women of Waterside Market',
  'How the market women of Monrovia organized to feed their communities and resist the chaos of war.',
  '<p>The women of Waterside Market in Monrovia were among the unsung heroes of the Liberian Civil War. When food supplies were cut off and armed groups controlled the roads, these women organized themselves into networks that kept their communities alive.</p><p>They pooled their resources, shared information about safe routes, and developed systems for distributing food to the most vulnerable. They negotiated with armed groups at checkpoints, often putting themselves at great risk to transport essential supplies.</p><h3>Organized for Survival</h3><p>The market women created a system of rotating lookouts, food storage, and distribution that functioned even during the most intense fighting. They prioritized children, pregnant women, and the elderly.</p><blockquote>"We are market women. We know how to organize. We know how to negotiate. We know how to survive," said one of the organizers.</blockquote><p>Many of these women lost their lives during the war. But their networks survived and became the foundation for post-war community reconstruction. Today, the Waterside Market stands rebuilt, and the women who trade there carry forward the legacy of resilience and solidarity.</p><p>This story honors all of them — named and unnamed — who showed that even in the worst of times, collective action and mutual care can sustain a community.</p>',
  '[]'::jsonb,
  '[]'::jsonb,
  'approved',
  false,
  'admin',
  now() - interval '11 days'
);
