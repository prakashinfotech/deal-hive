-- ============================================================
-- DealHive — Groupon Beauty & Spas Seed Data
-- Source: https://www.groupon.com/local/beauty-and-spas
-- Run: docker exec -i dealhive_postgres psql -U dealhive -d dealhive
-- ============================================================
-- NOTE: Does NOT delete existing data. Safe to append.
-- King Spa Chicago is intentionally omitted — already exists as deal #3.
-- ============================================================

-- ── New Vendor Users (IDs 15–23) ─────────────────────────────
INSERT INTO "Users" (
  "Id","UserName","NormalizedUserName","Email","NormalizedEmail",
  "EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp",
  "PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnabled","AccessFailedCount",
  "FirstName","LastName","Role","IsEmailVerified","CreatedAt"
) VALUES
  ('10000000-0000-0000-0000-000000000015','vendor_learnerx@dealhive.com','VENDOR_LEARNERX@DEALHIVE.COM','vendor_learnerx@dealhive.com','VENDOR_LEARNERX@DEALHIVE.COM',
   true,'$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/2','stamp-15','cc-15',
   false,false,false,0,'LeanerRx','Admin',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000016','vendor_spaworld@dealhive.com','VENDOR_SPAWORLD@DEALHIVE.COM','vendor_spaworld@dealhive.com','VENDOR_SPAWORLD@DEALHIVE.COM',
   true,'$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/2','stamp-16','cc-16',
   false,false,false,0,'Spa','World',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000017','vendor_gangnam@dealhive.com','VENDOR_GANGNAM@DEALHIVE.COM','vendor_gangnam@dealhive.com','VENDOR_GANGNAM@DEALHIVE.COM',
   true,'$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/2','stamp-17','cc-17',
   false,false,false,0,'Gangnam','Spa',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000018','vendor_weightlossmd@dealhive.com','VENDOR_WEIGHTLOSSMD@DEALHIVE.COM','vendor_weightlossmd@dealhive.com','VENDOR_WEIGHTLOSSMD@DEALHIVE.COM',
   true,'$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/2','stamp-18','cc-18',
   false,false,false,0,'Weight Loss','MD',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000019','vendor_lorelei@dealhive.com','VENDOR_LORELEI@DEALHIVE.COM','vendor_lorelei@dealhive.com','VENDOR_LORELEI@DEALHIVE.COM',
   true,'$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/2','stamp-19','cc-19',
   false,false,false,0,'Lorelei','Spa',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000020','vendor_relaxtuina@dealhive.com','VENDOR_RELAXTUINA@DEALHIVE.COM','vendor_relaxtuina@dealhive.com','VENDOR_RELAXTUINA@DEALHIVE.COM',
   true,'$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/2','stamp-20','cc-20',
   false,false,false,0,'Relax Tuina','Spa',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000021','vendor_renewbody@dealhive.com','VENDOR_RENEWBODY@DEALHIVE.COM','vendor_renewbody@dealhive.com','VENDOR_RENEWBODY@DEALHIVE.COM',
   true,'$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/2','stamp-21','cc-21',
   false,false,false,0,'Renew Body','SPA',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000022','vendor_kingspa_nj@dealhive.com','VENDOR_KINGSPA_NJ@DEALHIVE.COM','vendor_kingspa_nj@dealhive.com','VENDOR_KINGSPA_NJ@DEALHIVE.COM',
   true,'$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/2','stamp-22','cc-22',
   false,false,false,0,'King Spa','NJ',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000023','vendor_laserbar@dealhive.com','VENDOR_LASERBAR@DEALHIVE.COM','vendor_laserbar@dealhive.com','VENDOR_LASERBAR@DEALHIVE.COM',
   true,'$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/2','stamp-23','cc-23',
   false,false,false,0,'Laser Bar','Spa',1,true,NOW())
ON CONFLICT ("Id") DO NOTHING;

-- ── UserRoles ─────────────────────────────────────────────────
INSERT INTO "UserRoles" ("UserId","RoleId") VALUES
  ('10000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000016','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000017','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000018','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000019','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000020','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000102')
ON CONFLICT ("UserId","RoleId") DO NOTHING;

-- ── New Vendors (IDs 14–22) ───────────────────────────────────
INSERT INTO "Vendors" (
  "Id","UserId","BusinessName","Slug","Description","LogoUrl","Website",
  "AddressLine1","City","State","ZipCode","PhoneNumber",
  "Status","AvgRating","ReviewCount","TotalDeals","CreatedAt","UpdatedAt"
) VALUES
  ('20000000-0000-0000-0000-000000000014','10000000-0000-0000-0000-000000000015',
   'LeanerRx','learnerx',
   'Telehealth weight-loss program offering clinician-supervised semaglutide and tirzepatide treatments for lasting results.',
   NULL,'https://learnerx.com','Online','Multiple','','','',1,4.5,472,1,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000015','10000000-0000-0000-0000-000000000016',
   'Spa World Centreville','spa-world-centreville',
   'Premier Korean spa and wellness destination in Northern Virginia with pools, saunas, and full-service spa treatments.',
   NULL,'https://spaworld.us','13900 Metrotech Dr','Centreville','VA','20121','(703) 815-8000',1,4.7,63106,3,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000016','10000000-0000-0000-0000-000000000017',
   'Gangnam Spa Houston','gangnam-spa-houston',
   'Authentic Korean jjimjilbang spa in Houston featuring gender-separated bathhouses, themed saunas, and relaxation zones.',
   NULL,'https://gangnamspas.com','9889 Bellaire Blvd','Houston','TX','77036','(713) 774-9900',1,4.8,14623,2,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000017','10000000-0000-0000-0000-000000000018',
   'Weight Loss MD','weight-loss-md',
   'Medical weight-loss clinic in Greenwood Village offering physician-supervised tirzepatide and GLP-1 programs.',
   NULL,'https://weightlossmd.com','8200 E Belleview Ave','Greenwood Village','CO','80111','(720) 555-0118',1,4.7,4486,2,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000018','10000000-0000-0000-0000-000000000019',
   'Lorelei Spa','lorelei-spa',
   'Boutique day spa in Port Charlotte offering signature massages, couples packages, and champagne experiences.',
   NULL,'https://loreleispa.com','1234 Tamiami Trail','Port Charlotte','FL','33948','(941) 555-0119',1,4.5,156,1,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000019','10000000-0000-0000-0000-000000000020',
   'Relax Tuina Spa','relax-tuina-spa-raleigh',
   'Raleigh massage therapy studio specializing in therapeutic tuina, deep-tissue, and couples massage.',
   NULL,'https://relaxtuinaspa.com','4112 Blue Ridge Rd','Raleigh','NC','27612','(919) 555-0120',1,4.7,136,1,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000020','10000000-0000-0000-0000-000000000021',
   'Renew Body SPA NYC','renew-body-spa-nyc',
   'Manhattan day spa offering therapeutic massage, hot stone treatments, and full-body rejuvenation services.',
   NULL,'https://renewbodyspa.com','244 W 54th St','New York','NY','10019','(212) 555-0121',1,4.5,3956,2,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000021','10000000-0000-0000-0000-000000000022',
   'King Spa & Sauna NJ','king-spa-sauna-nj',
   'Korean spa experience in Palisades Park, NJ featuring traditional jimjilbang saunas and gender-separated bathing facilities.',
   NULL,'https://kingspausa.com','321 Main St','Palisades Park','NJ','07650','(201) 555-0122',1,4.6,64678,2,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000022','10000000-0000-0000-0000-000000000023',
   'Laser Bar and Spa','laser-bar-and-spa-manhattan',
   'Manhattan laser spa specializing in high-power laser hair removal with thousands of 5-star reviews across NYC locations.',
   NULL,'https://laserbarandspa.com','509 Madison Ave','New York','NY','10022','(212) 555-0123',1,4.9,2104,1,NOW(),NOW())
ON CONFLICT ("Id") DO NOTHING;

-- ── New Deals (IDs 15–23) ─────────────────────────────────────
-- Status: 2=Active | Type: 0=Service 1=Travel 2=Goods 3=Experience
INSERT INTO "Deals" (
  "Id","VendorId","CategoryId","Title","Slug","ShortDescription","Description",
  "FinePrint","Highlights","Type","Status",
  "OriginalPrice","DiscountedPrice","Currency",
  "QuantitySold","QuantityTotal","QuantityLimit",
  "AvgRating","ReviewCount","ViewCount","VoucherValidity",
  "IsFeatured","StartsAt","ExpiresAt","CreatedAt","UpdatedAt"
) VALUES

-- 15. LeanerRx — Semaglutide Weight-Loss Program
('30000000-0000-0000-0000-000000000015',
 '20000000-0000-0000-0000-000000000014',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='beauty-spas'),
 'LeanerRx: Semaglutide or Tirzepatide Weight-Loss Program',
 'learnerx-semaglutide-tirzepatide-weight-loss-program',
 'Clinician-supervised GLP-1 weight-loss program with semaglutide or tirzepatide — delivered to your door.',
 '<p>LeanerRx connects you with licensed clinicians who prescribe FDA-approved GLP-1 medications like semaglutide (Ozempic/Wegovy) and tirzepatide (Mounjaro/Zepbound). Everything is handled online — consultations, prescriptions, and home delivery.</p><ul><li>Licensed medical providers</li><li>Medication shipped to your door</li><li>Ongoing clinical support included</li><li>No insurance required</li></ul>',
 'Telehealth consultation required. Results vary. Not suitable for everyone — contraindications apply. Prescription subject to medical review.',
 '["Clinician-supervised","FDA-approved medications","Home delivery","Ongoing support","No insurance needed"]',
 0,2,249.00,89.10,'USD',472,5000,1,4.5,472,3800,90,true,
 NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', NOW()-INTERVAL '5 days',NOW()),

-- 16. Spa World Centreville — All-Day Pass
('30000000-0000-0000-0000-000000000016',
 '20000000-0000-0000-0000-000000000015',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='beauty-spas'),
 'Spa World Centreville: Indulge in Total Relaxation',
 'spa-world-centreville-all-day-relaxation',
 'Full-day access to Northern Virginia''s premier Korean spa featuring indoor/outdoor pools, themed saunas, and a full-service spa.',
 '<p>Spa World is the Washington DC area''s most beloved Korean wellness retreat. Your all-day pass includes access to gender-separated bathhouses, hot and cold mineral pools, six themed saunas (charcoal, gem, jade, salt cave, and more), a rooftop pool, food court, lounge, and jimjilbang area.</p><p>Optional spa treatments — massages, facials, body scrubs — are available for an additional charge.</p>',
 'Towels, jimjilbang uniform, and locker included. No outside food or beverages. Guests must shower before entering pools.',
 '["All-day access","6 themed saunas","Indoor & rooftop pools","Jimjilbang uniform included","Food court on site"]',
 0,2,45.00,31.50,'USD',63106,100000,4,4.7,63106,120000,90,true,
 NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', NOW()-INTERVAL '10 days',NOW()),

-- 17. Gangnam Spa Houston — Full-Day Pass
('30000000-0000-0000-0000-000000000017',
 '20000000-0000-0000-0000-000000000016',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='beauty-spas'),
 'Gangnam Spa Houston: Full Spa Day Experience',
 'gangnam-spa-houston-full-day-pass',
 'Experience Houston''s top-rated Korean jjimjilbang with heated pools, saunas, and full spa access.',
 '<p>Gangnam Spa in Houston''s Chinatown district is a full-service Korean wellness center with authentic jjimjilbang facilities. Enjoy heated pools, cold plunge, multiple saunas, and the communal jimjilbang lounge room. Add-on massage and body scrub services are available at the spa.</p>',
 'Uniform and locker included. Gender-separated bath areas. Valid any day during business hours.',
 '["Gender-separated bathhouses","Heated mineral pools","Multiple saunas","Communal lounge","Add-on treatments available"]',
 0,2,48.00,42.00,'USD',14623,50000,4,4.8,14623,45000,90,false,
 NOW() - INTERVAL '7 days', NOW() + INTERVAL '23 days', NOW()-INTERVAL '7 days',NOW()),

-- 18. Weight Loss MD — 4-Week Tirzepatide Program
('30000000-0000-0000-0000-000000000018',
 '20000000-0000-0000-0000-000000000017',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='beauty-spas'),
 'Weight Loss MD: 4-Week Physician-Supervised Tirzepatide Program',
 'weight-loss-md-4-week-tirzepatide-program',
 'Start your medical weight-loss journey with a 4-week tirzepatide program supervised by a licensed physician.',
 '<p>Weight Loss MD in Greenwood Village offers one of Colorado''s most trusted medical weight-loss programs. Their physicians have helped thousands of patients achieve lasting results through personalized GLP-1 protocols. This offer includes your initial consultation, lab work review, and 4-week tirzepatide supply.</p>',
 'New patients only. Medical consultation required. Results vary by individual. Lab work may incur additional fees.',
 '["Physician-supervised","4-week supply included","Personalized protocol","In-person consultations","Proven results"]',
 0,2,699.00,116.10,'USD',4486,10000,1,4.7,4486,28000,90,true,
 NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days', NOW()-INTERVAL '3 days',NOW()),

-- 19. Lorelei Spa — Signature/Couple's Massage with Champagne
('30000000-0000-0000-0000-000000000019',
 '20000000-0000-0000-0000-000000000018',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='beauty-spas'),
 'Lorelei Spa: Signature or Couple''s Massage with Champagne Toast',
 'lorelei-spa-signature-couples-massage-champagne',
 'Luxurious signature or couples massage experience complete with a champagne toast at Port Charlotte''s premier boutique spa.',
 '<p>Lorelei Spa elevates every visit with thoughtful touches. Choose from their signature therapeutic massage or a romantic side-by-side couples treatment. Each session concludes with a chilled champagne toast in the relaxation lounge — perfect for anniversaries, birthdays, or a well-deserved treat.</p>',
 'Gratuity not included. Champagne substitution available for non-drinkers. Book 48 hours in advance.',
 '["Champagne toast included","Solo or couples option","Private treatment rooms","Aromatherapy","Complimentary robe & slippers"]',
 0,2,305.00,106.20,'USD',156,500,2,4.5,156,1200,120,false,
 NOW() - INTERVAL '6 days', NOW() + INTERVAL '24 days', NOW()-INTERVAL '6 days',NOW()),

-- 20. Relax Tuina Spa Raleigh — Deep Tissue / Couple's Massage
('30000000-0000-0000-0000-000000000020',
 '20000000-0000-0000-0000-000000000019',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='beauty-spas'),
 'Relax Tuina Spa Raleigh: Deep-Tissue or Couple''s Massage',
 'relax-tuina-spa-raleigh-deep-tissue-couples-massage',
 'Therapeutic deep-tissue or couples massage at Raleigh''s beloved tuina spa — up to 68% off regular rates.',
 '<p>Relax Tuina Spa combines traditional Chinese tuina bodywork with Western massage therapy techniques for a uniquely restorative experience. Their skilled therapists address chronic tension, muscle soreness, and stress with deep, targeted pressure. Couples sessions are available side-by-side in a private room.</p>',
 'Call to book appointment. 24-hour cancellation required. Gratuity not included.',
 '["Traditional tuina technique","Deep-tissue therapy","Couples room available","Chronic tension relief","Experienced therapists"]',
 0,2,125.00,40.50,'USD',136,1000,2,4.7,136,900,90,false,
 NOW() - INTERVAL '4 days', NOW() + INTERVAL '26 days', NOW()-INTERVAL '4 days',NOW()),

-- 21. Renew Body SPA NYC — Massage with Hot Stones
('30000000-0000-0000-0000-000000000021',
 '20000000-0000-0000-0000-000000000020',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='beauty-spas'),
 'Renew Body SPA NYC: Therapeutic Massage with Hot Stones',
 'renew-body-spa-nyc-massage-hot-stones',
 'Unwind with a therapeutic massage and hot stone treatment at this highly rated Midtown Manhattan day spa.',
 '<p>Renew Body SPA in Midtown Manhattan offers a tranquil escape from the city''s energy. Their experienced massage therapists combine Swedish relaxation techniques with heated basalt stones to melt away deep muscle tension. The warm stones improve circulation and promote a profound sense of calm.</p>',
 'Gratuity not included. Book online or by phone. 24-hour cancellation policy.',
 '["Heated basalt stones","Swedish base technique","Deep muscle relaxation","Midtown Manhattan location","60 or 90 min options"]',
 0,2,90.00,43.20,'USD',3956,10000,2,4.5,3956,18000,90,false,
 NOW() - INTERVAL '8 days', NOW() + INTERVAL '22 days', NOW()-INTERVAL '8 days',NOW()),

-- 22. King Spa & Sauna NJ — Korean Spa Escape
('30000000-0000-0000-0000-000000000022',
 '20000000-0000-0000-0000-000000000021',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='beauty-spas'),
 'King Spa & Sauna NJ: All-Day Korean Spa Escape',
 'king-spa-sauna-nj-korean-spa-escape-admission',
 'Enjoy a full day of authentic Korean spa relaxation in Palisades Park, NJ — minutes from the George Washington Bridge.',
 '<p>King Spa & Sauna NJ brings the authentic Korean jjimjilbang experience to the greater New York area. Just minutes from the GW Bridge in Palisades Park, this beloved spa features gender-separated bathhouses with multiple hot and cold pools, themed sauna rooms, and a communal jimjilbang floor where you can lounge, eat, and rest for hours.</p>',
 'Towels, jimjilbang uniform, and locker included. No outside food. Children welcome with adult supervision.',
 '["All-day admission","Gender-separated bathhouses","Multiple themed saunas","Hot & cold pools","Jimjilbang uniform included"]',
 0,2,70.00,53.10,'USD',64678,200000,4,4.6,64678,180000,90,true,
 NOW() - INTERVAL '12 days', NOW() + INTERVAL '18 days', NOW()-INTERVAL '12 days',NOW()),

-- 23. Laser Bar and Spa Manhattan — Laser Hair Removal
('30000000-0000-0000-0000-000000000023',
 '20000000-0000-0000-0000-000000000022',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='beauty-spas'),
 'Laser Bar and Spa Manhattan: Laser Hair Removal — Up to 89% Off',
 'laser-bar-and-spa-manhattan-laser-hair-removal',
 'High-powered laser hair removal at Manhattan''s highest-rated laser spa — permanent results at a fraction of the cost.',
 '<p>Laser Bar and Spa is New York City''s most reviewed laser hair removal destination. Their state-of-the-art Nd:YAG and Alexandrite laser systems deliver fast, comfortable, and effective permanent hair reduction for all skin tones. Treat the upper lip, underarms, bikini, full legs, back, or any other area.</p><p>Sessions are quick, typically 10–30 minutes depending on the area, with no downtime required.</p>',
 'Results vary. Avoid sun exposure 2 weeks before treatment. Shave 24 hours prior. Valid on one area per voucher.',
 '["Highest-rated NYC laser spa","All skin tones","No downtime","Quick sessions","Permanent hair reduction"]',
 0,2,150.00,17.10,'USD',2104,20000,5,4.9,2104,35000,365,true,
 NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days', NOW()-INTERVAL '2 days',NOW())
ON CONFLICT ("Id") DO NOTHING;

-- ── Deal Options (IDs 15–23) ──────────────────────────────────
INSERT INTO "DealOptions" ("Id","DealId","Title","Description","Price","AvailableQty","SoldQty","IsActive","SortOrder","CreatedAt","UpdatedAt") VALUES
-- Deal 15: LeanerRx
('40000000-0000-0000-0000-000000000015','30000000-0000-0000-0000-000000000015','Semaglutide Program','4-week semaglutide starter program',89.10,2000,0,true,1,NOW(),NOW()),
('40000000-0000-0000-0000-000000000016','30000000-0000-0000-0000-000000000015','Tirzepatide Program','4-week tirzepatide starter program',109.00,2000,0,true,2,NOW(),NOW()),

-- Deal 16: Spa World Centreville
('40000000-0000-0000-0000-000000000017','30000000-0000-0000-0000-000000000016','Adult Weekday Pass','Monday–Friday all-day access',31.50,5000,0,true,1,NOW(),NOW()),
('40000000-0000-0000-0000-000000000018','30000000-0000-0000-0000-000000000016','Adult Weekend Pass','Saturday–Sunday all-day access',38.00,3000,0,true,2,NOW(),NOW()),

-- Deal 17: Gangnam Spa Houston
('40000000-0000-0000-0000-000000000019','30000000-0000-0000-0000-000000000017','General Admission','Full day access, any day',42.00,5000,0,true,1,NOW(),NOW()),

-- Deal 18: Weight Loss MD
('40000000-0000-0000-0000-000000000020','30000000-0000-0000-0000-000000000018','4-Week Tirzepatide Program','Consultation + 4-week supply',116.10,1000,0,true,1,NOW(),NOW()),

-- Deal 19: Lorelei Spa
('40000000-0000-0000-0000-000000000021','30000000-0000-0000-0000-000000000019','60-Min Signature Massage','Signature massage with champagne',106.20,100,0,true,1,NOW(),NOW()),
('40000000-0000-0000-0000-000000000022','30000000-0000-0000-0000-000000000019','Couples Massage Package','Side-by-side couples massage with champagne',189.00,50,0,true,2,NOW(),NOW()),

-- Deal 20: Relax Tuina Spa Raleigh
('40000000-0000-0000-0000-000000000023','30000000-0000-0000-0000-000000000020','60-Min Deep-Tissue Massage','Single deep-tissue session',40.50,200,0,true,1,NOW(),NOW()),
('40000000-0000-0000-0000-000000000024','30000000-0000-0000-0000-000000000020','60-Min Couples Massage','Side-by-side couples session',75.00,80,0,true,2,NOW(),NOW()),

-- Deal 21: Renew Body SPA NYC
('40000000-0000-0000-0000-000000000025','30000000-0000-0000-0000-000000000021','60-Min Hot Stone Massage','Swedish massage with hot stones',43.20,500,0,true,1,NOW(),NOW()),
('40000000-0000-0000-0000-000000000026','30000000-0000-0000-0000-000000000021','90-Min Hot Stone Massage','Extended hot stone therapy',65.00,300,0,true,2,NOW(),NOW()),

-- Deal 22: King Spa NJ
('40000000-0000-0000-0000-000000000027','30000000-0000-0000-0000-000000000022','Weekday Admission','Monday–Thursday all-day pass',53.10,5000,0,true,1,NOW(),NOW()),
('40000000-0000-0000-0000-000000000028','30000000-0000-0000-0000-000000000022','Weekend Admission','Friday–Sunday all-day pass',62.00,3000,0,true,2,NOW(),NOW()),

-- Deal 23: Laser Bar and Spa
('40000000-0000-0000-0000-000000000029','30000000-0000-0000-0000-000000000023','Small Area (Lip or Chin)','Single laser session — lip or chin',17.10,2000,0,true,1,NOW(),NOW()),
('40000000-0000-0000-0000-000000000030','30000000-0000-0000-0000-000000000023','Medium Area (Underarms or Bikini)','Single laser session — underarms or bikini',39.00,1500,0,true,2,NOW(),NOW()),
('40000000-0000-0000-0000-000000000031','30000000-0000-0000-0000-000000000023','Large Area (Full Legs or Back)','Single laser session — full legs or back',89.00,800,0,true,3,NOW(),NOW())
ON CONFLICT ("Id") DO NOTHING;

-- ── Deal Images (IDs 25–33) ───────────────────────────────────
INSERT INTO "DealImages" ("Id","DealId","Url","AltText","IsPrimary","SortOrder","CreatedAt","UpdatedAt") VALUES
('50000000-0000-0000-0000-000000000025','30000000-0000-0000-0000-000000000015',
 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800','Weight loss wellness program',true,1,NOW(),NOW()),

('50000000-0000-0000-0000-000000000026','30000000-0000-0000-0000-000000000016',
 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800','Korean spa pool and sauna',true,1,NOW(),NOW()),
('50000000-0000-0000-0000-000000000027','30000000-0000-0000-0000-000000000016',
 'https://images.unsplash.com/photo-1510021711994-93f8f22ea147?w=800','Spa relaxation pools',false,2,NOW(),NOW()),

('50000000-0000-0000-0000-000000000028','30000000-0000-0000-0000-000000000017',
 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800','Korean jjimjilbang sauna',true,1,NOW(),NOW()),

('50000000-0000-0000-0000-000000000029','30000000-0000-0000-0000-000000000018',
 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800','Medical weight loss consultation',true,1,NOW(),NOW()),

('50000000-0000-0000-0000-000000000030','30000000-0000-0000-0000-000000000019',
 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800','Couples massage with champagne',true,1,NOW(),NOW()),

('50000000-0000-0000-0000-000000000031','30000000-0000-0000-0000-000000000020',
 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800','Deep tissue massage therapy',true,1,NOW(),NOW()),

('50000000-0000-0000-0000-000000000032','30000000-0000-0000-0000-000000000021',
 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800','Hot stone massage NYC spa',true,1,NOW(),NOW()),

('50000000-0000-0000-0000-000000000033','30000000-0000-0000-0000-000000000022',
 'https://images.unsplash.com/photo-1510021711994-93f8f22ea147?w=800','King Spa NJ Korean sauna',true,1,NOW(),NOW()),

('50000000-0000-0000-0000-000000000034','30000000-0000-0000-0000-000000000023',
 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800','Laser hair removal Manhattan',true,1,NOW(),NOW()),
('50000000-0000-0000-0000-000000000035','30000000-0000-0000-0000-000000000023',
 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800','Laser treatment skin care',false,2,NOW(),NOW())
ON CONFLICT ("Id") DO NOTHING;

-- ── Verification ──────────────────────────────────────────────
SELECT tbl, cnt FROM (
  SELECT 'Beauty-Spas Deals' AS tbl, COUNT(*)::text AS cnt
  FROM "Deals" d
  JOIN "Categories" c ON c."Id" = d."CategoryId"
  WHERE c."Slug" = 'beauty-spas'
  UNION ALL
  SELECT 'Total Deals', COUNT(*)::text FROM "Deals"
  UNION ALL
  SELECT 'Total Vendors', COUNT(*)::text FROM "Vendors"
) t ORDER BY tbl;
