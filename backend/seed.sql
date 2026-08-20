-- ============================================================
-- DealHive Seed Data — sourced from Groupon.com
-- Run against: dealhive database (PostgreSQL 16)
-- ============================================================

-- ── Clean existing seed data ─────────────────────────────────
DELETE FROM "WishlistItems";
DELETE FROM "DealImages";
DELETE FROM "DealOptions";
DELETE FROM "Deals";
DELETE FROM "Vendors";
DELETE FROM "UserRoles";
DELETE FROM "Roles";
DELETE FROM "Users";
DELETE FROM "Categories";

-- ── Categories ───────────────────────────────────────────────
INSERT INTO "Categories" ("Name","Slug","Icon","ImageUrl","ParentId","IsActive","SortOrder") VALUES
  ('Beauty & Spas',  'beauty-spas',   '💆', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400', NULL, true, 1),
  ('Things To Do',   'things-to-do',  '🎭', 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400', NULL, true, 2),
  ('Travel',         'travel',        '✈️', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400', NULL, true, 3),
  ('Goods',          'goods',         '🛍️', 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400', NULL, true, 4),
  ('Health',         'health',        '🏋️', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', NULL, true, 5),
  ('Restaurants',    'restaurants',   '🍽️', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', NULL, true, 6),
  ('Auto & Home',    'auto-home',     '🔧', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400', NULL, true, 7);

-- ── Roles ────────────────────────────────────────────────────
INSERT INTO "Roles" ("Id","Name","NormalizedName","ConcurrencyStamp") VALUES
  ('00000000-0000-0000-0000-000000000101','Consumer', 'CONSUMER', 'stamp-consumer'),
  ('00000000-0000-0000-0000-000000000102','Vendor',   'VENDOR',   'stamp-vendor'),
  ('00000000-0000-0000-0000-000000000103','Admin',    'ADMIN',    'stamp-admin');

-- ── Users ────────────────────────────────────────────────────
-- Role enum: Consumer=0, Vendor=1, Admin=2, SuperAdmin=3
-- PasswordHash = ASP.NET Identity PBKDF2 hash of "Password1!" (dev only)
INSERT INTO "Users" (
  "Id","UserName","NormalizedUserName","Email","NormalizedEmail",
  "EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp",
  "PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnabled","AccessFailedCount",
  "FirstName","LastName","Role","IsEmailVerified","CreatedAt"
) VALUES
  -- Consumer test user
  ('10000000-0000-0000-0000-000000000001','test@dealhive.com','TEST@DEALHIVE.COM','test@dealhive.com','TEST@DEALHIVE.COM',
   true,'AQAAAAEAACcQAAAAELgYJ3qZaQj/sSrgJTvsLBWGAfTlTHQ2heE6o4ZvOM0pNCWClyhew5CKBPxQ3S4SLg==','stamp-1','cc-1',
   false,false,false,0,'Test','User',0,true,NOW()),
  -- Vendor users
  ('10000000-0000-0000-0000-000000000002','vendor_derma@dealhive.com','VENDOR_DERMA@DEALHIVE.COM','vendor_derma@dealhive.com','VENDOR_DERMA@DEALHIVE.COM',
   true,'AQAAAAEAACcQAAAAELgYJ3qZaQj/sSrgJTvsLBWGAfTlTHQ2heE6o4ZvOM0pNCWClyhew5CKBPxQ3S4SLg==','stamp-2','cc-2',
   false,false,false,0,'Derma','Bliss',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000003','vendor_pure@dealhive.com','VENDOR_PURE@DEALHIVE.COM','vendor_pure@dealhive.com','VENDOR_PURE@DEALHIVE.COM',
   true,'AQAAAAEAACcQAAAAELgYJ3qZaQj/sSrgJTvsLBWGAfTlTHQ2heE6o4ZvOM0pNCWClyhew5CKBPxQ3S4SLg==','stamp-3','cc-3',
   false,false,false,0,'Pure','Serenity',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000004','vendor_king@dealhive.com','VENDOR_KING@DEALHIVE.COM','vendor_king@dealhive.com','VENDOR_KING@DEALHIVE.COM',
   true,'AQAAAAEAACcQAAAAELgYJ3qZaQj/sSrgJTvsLBWGAfTlTHQ2heE6o4ZvOM0pNCWClyhew5CKBPxQ3S4SLg==','stamp-4','cc-4',
   false,false,false,0,'King','Spa',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000005','vendor_london@dealhive.com','VENDOR_LONDON@DEALHIVE.COM','vendor_london@dealhive.com','VENDOR_LONDON@DEALHIVE.COM',
   true,'AQAAAAEAACcQAAAAELgYJ3qZaQj/sSrgJTvsLBWGAfTlTHQ2heE6o4ZvOM0pNCWClyhew5CKBPxQ3S4SLg==','stamp-5','cc-5',
   false,false,false,0,'London','House',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000006','vendor_tours@dealhive.com','VENDOR_TOURS@DEALHIVE.COM','vendor_tours@dealhive.com','VENDOR_TOURS@DEALHIVE.COM',
   true,'AQAAAAEAACcQAAAAELgYJ3qZaQj/sSrgJTvsLBWGAfTlTHQ2heE6o4ZvOM0pNCWClyhew5CKBPxQ3S4SLg==','stamp-6','cc-6',
   false,false,false,0,'Chicago','Tours',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000007','vendor_massage@dealhive.com','VENDOR_MASSAGE@DEALHIVE.COM','vendor_massage@dealhive.com','VENDOR_MASSAGE@DEALHIVE.COM',
   true,'AQAAAAEAACcQAAAAELgYJ3qZaQj/sSrgJTvsLBWGAfTlTHQ2heE6o4ZvOM0pNCWClyhew5CKBPxQ3S4SLg==','stamp-7','cc-7',
   false,false,false,0,'Massage','House',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000008','vendor_bared@dealhive.com','VENDOR_BARED@DEALHIVE.COM','vendor_bared@dealhive.com','VENDOR_BARED@DEALHIVE.COM',
   true,'AQAAAAEAACcQAAAAELgYJ3qZaQj/sSrgJTvsLBWGAfTlTHQ2heE6o4ZvOM0pNCWClyhew5CKBPxQ3S4SLg==','stamp-8','cc-8',
   false,false,false,0,'Bared','Monkey',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000009','vendor_infinity@dealhive.com','VENDOR_INFINITY@DEALHIVE.COM','vendor_infinity@dealhive.com','VENDOR_INFINITY@DEALHIVE.COM',
   true,'AQAAAAEAACcQAAAAELgYJ3qZaQj/sSrgJTvsLBWGAfTlTHQ2heE6o4ZvOM0pNCWClyhew5CKBPxQ3S4SLg==','stamp-9','cc-9',
   false,false,false,0,'Infinity','Laser',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000010','vendor_catalina@dealhive.com','VENDOR_CATALINA@DEALHIVE.COM','vendor_catalina@dealhive.com','VENDOR_CATALINA@DEALHIVE.COM',
   true,'AQAAAAEAACcQAAAAELgYJ3qZaQj/sSrgJTvsLBWGAfTlTHQ2heE6o4ZvOM0pNCWClyhew5CKBPxQ3S4SLg==','stamp-10','cc-10',
   false,false,false,0,'Catalina','Flyer',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000011','vendor_valvoline@dealhive.com','VENDOR_VALVOLINE@DEALHIVE.COM','vendor_valvoline@dealhive.com','VENDOR_VALVOLINE@DEALHIVE.COM',
   true,'AQAAAAEAACcQAAAAELgYJ3qZaQj/sSrgJTvsLBWGAfTlTHQ2heE6o4ZvOM0pNCWClyhew5CKBPxQ3S4SLg==','stamp-11','cc-11',
   false,false,false,0,'Valvoline','IOC',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000012','vendor_wolf@dealhive.com','VENDOR_WOLF@DEALHIVE.COM','vendor_wolf@dealhive.com','VENDOR_WOLF@DEALHIVE.COM',
   true,'AQAAAAEAACcQAAAAELgYJ3qZaQj/sSrgJTvsLBWGAfTlTHQ2heE6o4ZvOM0pNCWClyhew5CKBPxQ3S4SLg==','stamp-12','cc-12',
   false,false,false,0,'Great Wolf','Lodge',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000013','vendor_iconic@dealhive.com','VENDOR_ICONIC@DEALHIVE.COM','vendor_iconic@dealhive.com','VENDOR_ICONIC@DEALHIVE.COM',
   true,'AQAAAAEAACcQAAAAELgYJ3qZaQj/sSrgJTvsLBWGAfTlTHQ2heE6o4ZvOM0pNCWClyhew5CKBPxQ3S4SLg==','stamp-13','cc-13',
   false,false,false,0,'Iconic','Tours',1,true,NOW()),
  ('10000000-0000-0000-0000-000000000014','vendor_warwick@dealhive.com','VENDOR_WARWICK@DEALHIVE.COM','vendor_warwick@dealhive.com','VENDOR_WARWICK@DEALHIVE.COM',
   true,'AQAAAAEAACcQAAAAELgYJ3qZaQj/sSrgJTvsLBWGAfTlTHQ2heE6o4ZvOM0pNCWClyhew5CKBPxQ3S4SLg==','stamp-14','cc-14',
   false,false,false,0,'Warwick','Allerton',1,true,NOW()),
  -- Admin user
  ('10000000-0000-0000-0000-000000000024','admin@dealhive.com','ADMIN@DEALHIVE.COM','admin@dealhive.com','ADMIN@DEALHIVE.COM',
   true,'AQAAAAEAACcQAAAAELgYJ3qZaQj/sSrgJTvsLBWGAfTlTHQ2heE6o4ZvOM0pNCWClyhew5CKBPxQ3S4SLg==','stamp-admin-1','cc-admin-1',
   false,false,false,0,'Admin','User',2,true,NOW());

-- ── UserRoles ─────────────────────────────────────────────────
INSERT INTO "UserRoles" ("UserId","RoleId") VALUES
  ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000101'), -- consumer
  ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000102'), -- vendors
  ('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000102'),
  ('10000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000103'); -- admin

-- ── Vendors ──────────────────────────────────────────────────
-- Status: 1 = Active
INSERT INTO "Vendors" (
  "Id","UserId","BusinessName","Slug","Description","LogoUrl","Website",
  "AddressLine1","City","State","ZipCode","PhoneNumber",
  "Status","AvgRating","ReviewCount","TotalDeals","CreatedAt","UpdatedAt"
) VALUES
  ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002',
   'Derma Bliss Beauty Spa','derma-bliss-beauty-spa',
   'Award-winning laser & aesthetic spa in Lincoln Park offering hair removal, facials, and skin treatments with certified professionals.',
   NULL,'https://dermabliss.com','2140 N Lincoln Ave','Chicago','IL','60614','(312) 555-0101',1,4.7,128,6,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000003',
   'Pure Serenity Spa','pure-serenity-spa',
   'Tranquil retreat offering Swedish, deep-tissue, and hot stone massages in a serene boutique setting.',
   NULL,'https://pureserenityspa.com','939 W Belmont Ave','Chicago','IL','60657','(312) 555-0102',1,4.6,89,4,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000004',
   'King Spa and Sauna Chicago','king-spa-sauna-chicago',
   'Authentic Korean spa with multiple saunas, pools, and wellness facilities open 24 hours.',
   NULL,'https://kingspausa.com','809 Civic Center Dr','Niles','IL','60714','(847) 555-0103',1,4.8,412,8,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000005',
   'The Spa at London House Chicago','the-spa-at-london-house-chicago',
   'Luxury hotel spa on the Magnificent Mile offering premium beauty and wellness treatments.',
   NULL,'https://londonhousechicago.com','85 E Wacker Dr','Chicago','IL','60601','(312) 555-0104',1,4.9,203,5,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000006',
   'Chicago Architecture Boat Tours','chicago-architecture-boat-tours',
   'Chicago''s premier architectural boat tour company exploring the city''s iconic skyline along the Chicago River.',
   NULL,'https://architecturetourchicago.com','455 N Cityfront Plaza Dr','Chicago','IL','60611','(312) 555-0105',1,4.8,876,3,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000007',
   'Massage House','massage-house',
   'Couples and solo massage specialists offering Swedish, hot stone, and therapeutic body treatments.',
   NULL,'https://massagehouse.com','3344 N Broadway','Chicago','IL','60657','(312) 555-0106',1,4.4,156,4,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000008',
   'Bared Monkey Laser Spa','bared-monkey-laser-spa',
   'NYC''s top-rated laser hair removal and body contouring clinic with locations across Manhattan.',
   NULL,'https://baredmonkey.com','247 W 35th St','New York','NY','10001','(212) 555-0107',1,4.6,524,5,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000009',
   'Infinity Laser Spa','infinity-laser-spa',
   'Unlimited laser hair removal at a monthly membership price — multiple Manhattan locations.',
   NULL,'https://infinitylaserspa.com','16 E 40th St','New York','NY','10016','(212) 555-0108',1,4.5,312,3,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000010',
   'The Catalina Flyer','the-catalina-flyer',
   'Southern California''s premier high-speed catamaran ferry service to beautiful Catalina Island.',
   NULL,'https://catalinaflyer.com','400 Main St','Newport Beach','CA','92661','(949) 555-0109',1,4.7,1024,2,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000011',
   'Valvoline Instant Oil Change','valvoline-instant-oil-change',
   'Fast, professional oil change service while you stay in your car — no appointment needed.',
   NULL,'https://valvoline.com','5280 W Century Blvd','Los Angeles','CA','90045','(310) 555-0110',1,4.3,2134,3,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000012',
   'Great Wolf Lodge Chicago/Gurnee','great-wolf-lodge-chicago',
   'Family resort hotel featuring an indoor water park with daily access included in every stay.',
   NULL,'https://greatwolf.com','1700 Nations Dr','Gurnee','IL','60031','(847) 555-0111',1,4.5,1872,4,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000013',
   'Iconic Tours NYC','iconic-tours-nyc',
   'New York City''s premier sightseeing company offering bus and boat combo tours of Manhattan.',
   NULL,'https://icontours.com','234 W 42nd St','New York','NY','10036','(212) 555-0112',1,4.6,445,3,NOW(),NOW()),

  ('20000000-0000-0000-0000-000000000013','10000000-0000-0000-0000-000000000014',
   'Warwick Allerton Chicago','warwick-allerton-chicago',
   'Historic landmark hotel on Chicago''s Magnificent Mile with classic elegance and modern amenities.',
   NULL,'https://warwickhotels.com','701 N Michigan Ave','Chicago','IL','60611','(312) 555-0113',1,4.4,456,2,NOW(),NOW());

-- ── Deals ────────────────────────────────────────────────────
-- Status: 2 = Active  |  Type: 0=Service 1=Travel 2=Goods 3=Experience
INSERT INTO "Deals" (
  "Id","VendorId","CategoryId","Title","Slug","ShortDescription","Description",
  "FinePrint","Highlights","Type","Status",
  "OriginalPrice","DiscountedPrice","Currency",
  "QuantitySold","QuantityTotal","QuantityLimit",
  "AvgRating","ReviewCount","ViewCount","VoucherValidity",
  "IsFeatured","StartsAt","ExpiresAt","CreatedAt","UpdatedAt"
) VALUES

-- 1. Derma Bliss — Laser Hair Removal (Chicago)
('30000000-0000-0000-0000-000000000001',
 '20000000-0000-0000-0000-000000000001',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='beauty-spas'),
 'Hair-Free & Carefree: 6 Laser Hair Removal Sessions',
 'derma-bliss-6-laser-hair-removal-sessions',
 'Six professional laser hair removal sessions at Lincoln Park''s award-winning Derma Bliss Beauty Spa.',
 '<p>Say goodbye to shaving and waxing forever. Derma Bliss Beauty Spa offers state-of-the-art laser hair removal with FDA-approved technology. Six sessions are typically enough for permanent hair reduction on most body areas.</p><ul><li>Certified laser technicians with 5+ years experience</li><li>Cooling technology for comfortable treatment</li><li>Suitable for all skin tones</li></ul>',
 'Must be 18+. Avoid sun exposure 2 weeks before treatment. Shave the area 24 hours prior. Voucher valid for 12 months.',
 '["6 laser sessions included","FDA-approved technology","All skin tones welcome","Certified technicians"]',
 0,2,590.00,103.50,'USD',347,1000,5,4.7,128,2840,365,true,
 NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', NOW()-INTERVAL '10 days',NOW()),

-- 2. Pure Serenity — Couples Massage (Chicago)
('30000000-0000-0000-0000-000000000002',
 '20000000-0000-0000-0000-000000000002',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='beauty-spas'),
 'Solo or Couples Deep-Tissue or Swedish Massage with Hot Stones',
 'pure-serenity-couples-massage-hot-stones',
 'Relaxing massage packages for individuals or couples with Swedish, deep-tissue, or hot stone techniques.',
 '<p>Unwind at Pure Serenity Spa in Lakeview with a premium massage experience tailored to your needs. Choose from Swedish relaxation, therapeutic deep-tissue, or warming hot stone massage — available for solo guests or couples side-by-side.</p><p>Each session includes aromatherapy and a complimentary scalp massage.</p>',
 'Gratuity not included. Book 48 hours in advance. Valid Monday–Friday only for this price.',
 '["60 or 90 min sessions","Couples room available","Aromatherapy included","Free scalp massage"]',
 0,2,110.00,80.10,'USD',203,500,2,4.6,89,1560,180,false,
 NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', NOW()-INTERVAL '5 days',NOW()),

-- 3. King Spa — All-Day Pass (Niles/Chicago)
('30000000-0000-0000-0000-000000000003',
 '20000000-0000-0000-0000-000000000003',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='beauty-spas'),
 'King Spa Chicago: All-Day Korean Wellness Experience',
 'king-spa-sauna-chicago-all-day-pass',
 'Full day of authentic Korean spa and sauna relaxation with access to multiple pools, saunas, and rest zones.',
 '<p>King Spa and Sauna is the Midwest''s premier Korean wellness center, offering over 50,000 sq ft of facilities. Your all-day pass includes access to multiple themed saunas (charcoal, infrared, salt cave), cold and hot plunge pools, lounge areas, and TV rooms.</p>',
 'Towels and jimjilbang uniform included. Private showers and lockers available. No outside food.',
 '["Full day access","Multiple themed saunas","Hot & cold pools","Jimjilbang uniform included","Open 24 hours"]',
 0,2,75.00,58.50,'USD',891,2000,4,4.8,412,4200,90,true,
 NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', NOW()-INTERVAL '15 days',NOW()),

-- 4. London House Spa — Facial + Massage + Manicure (Chicago)
('30000000-0000-0000-0000-000000000004',
 '20000000-0000-0000-0000-000000000004',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='beauty-spas'),
 'LondonHouse Chicago: Luxurious Facial, Massage & Manicure Combo',
 'the-spa-at-london-house-chicago-facial-massage-combo',
 'Indulge in a premium spa package at the Magnificent Mile''s most luxurious hotel spa.',
 '<p>The Spa at London House sits atop the iconic LondonHouse Chicago hotel, offering stunning river views and world-class treatments. This package combines a 50-minute customized facial, a 30-minute Swedish massage, and a luxury manicure.</p>',
 'Advance booking required. Robe and slippers provided. Complimentary spa snacks included.',
 '["50-min custom facial","30-min Swedish massage","Luxury manicure","River views","Hotel-quality amenities"]',
 0,2,174.00,99.00,'USD',156,300,2,4.9,203,1890,120,false,
 NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days', NOW()-INTERVAL '3 days',NOW()),

-- 5. Massage House — Couples Massage (Chicago)
('30000000-0000-0000-0000-000000000005',
 '20000000-0000-0000-0000-000000000006',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='beauty-spas'),
 '60 or 90-Minute Couples Swedish or Hot Stone Massage',
 'massage-house-couples-swedish-hot-stone',
 'Unwind together with a side-by-side couples massage featuring Swedish or hot stone techniques.',
 '<p>Massage House specializes in therapeutic massage for couples and individuals. Your session includes your choice of Swedish relaxation or hot stone therapy in a private couples room. Soft music, aromatherapy, and a post-massage herbal tea are included.</p>',
 'Call to book. 24-hour cancellation required. Gratuity not included.',
 '["Private couples room","Swedish or hot stone","Aromatherapy","Post-massage tea"]',
 0,2,120.00,94.77,'USD',118,400,2,4.4,156,980,90,false,
 NOW() - INTERVAL '8 days', NOW() + INTERVAL '22 days', NOW()-INTERVAL '8 days',NOW()),

-- 6. Architecture Boat Tour (Chicago)
('30000000-0000-0000-0000-000000000006',
 '20000000-0000-0000-0000-000000000005',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='things-to-do'),
 '90-Minute Chicago Architecture Boat Tour on the Chicago River',
 'chicago-architecture-boat-tour-90-min',
 'Cruise the iconic Chicago River on a 90-minute narrated architectural boat tour with expert guides.',
 '<p>Explore Chicago''s breathtaking skyline from the water on a narrated boat tour of the Chicago River. Expert architectural guides point out 50+ buildings, sharing fascinating stories about their design and history.</p><p>Departures from Navy Pier and Michigan Avenue.</p>',
 'Seasonal schedule. Tour runs rain or shine. Children under 3 free.',
 '["90-minute narrated tour","50+ buildings highlighted","Expert architectural guides","Rain or shine","Kids under 3 free"]',
 3,2,49.00,26.10,'USD',1240,5000,10,4.8,876,8400,365,true,
 NOW() - INTERVAL '20 days', NOW() + INTERVAL '60 days', NOW()-INTERVAL '20 days',NOW()),

-- 7. Bared Monkey — Laser Hair Removal + Membership (NYC)
('30000000-0000-0000-0000-000000000007',
 '20000000-0000-0000-0000-000000000007',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='beauty-spas'),
 'Get Smooth: Laser Hair Removal Sessions + Free First Month Membership',
 'bared-monkey-laser-hair-removal-membership',
 'Multiple laser hair removal sessions with a complimentary first month membership at NYC''s top-rated laser spa.',
 '<p>Bared Monkey Laser Spa uses the Candela GentleMax Pro — one of the industry''s most powerful and comfortable laser systems — for fast, effective permanent hair reduction. Treatment areas include underarms, legs, bikini, face, and more.</p><p>Your free first month membership gives you access to members-only pricing on additional treatments.</p>',
 'Results vary. Multiple sessions typically needed. Avoid sun exposure before treatment.',
 '["Candela GentleMax Pro laser","Free first-month membership","Multiple NYC locations","All skin tones","Quick sessions"]',
 0,2,51.00,23.49,'USD',445,2000,5,4.6,524,3200,365,false,
 NOW() - INTERVAL '7 days', NOW() + INTERVAL '23 days', NOW()-INTERVAL '7 days',NOW()),

-- 8. Infinity Laser — Unlimited Membership (NYC)
('30000000-0000-0000-0000-000000000008',
 '20000000-0000-0000-0000-000000000008',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='beauty-spas'),
 'Unlimited Laser Hair Removal: Smooth Skin All Year Round',
 'infinity-laser-spa-unlimited-hair-removal',
 'Annual unlimited laser hair removal membership — treat any area as many times as you need for one low price.',
 '<p>Infinity Laser Spa''s Unlimited Annual Membership gives you the freedom to eliminate unwanted hair without counting sessions. Treat any body area — arms, legs, underarms, bikini, face, back — as many times as needed throughout the year with no per-session fees.</p>',
 'Annual membership. Unlimited treatments on covered areas. New clients only for this offer price.',
 '["Unlimited treatments","Any body area","Annual membership","Multiple Manhattan locations","No per-session fees"]',
 0,2,1200.00,85.05,'USD',234,1000,1,4.5,312,2100,365,true,
 NOW() - INTERVAL '2 days', NOW() + INTERVAL '14 days', NOW()-INTERVAL '2 days',NOW()),

-- 9. Iconic Tours — NYC Night Bus + Statue of Liberty Cruise
('30000000-0000-0000-0000-000000000009',
 '20000000-0000-0000-0000-000000000012',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='things-to-do'),
 'NYC Night Bus Tour & Statue of Liberty Cruise — Double Views',
 'iconic-tours-nyc-night-bus-statue-liberty-cruise',
 'Combine a nighttime Manhattan bus tour with a daytime Statue of Liberty cruise for two iconic New York experiences.',
 '<p>See New York City''s glittering nighttime skyline from a double-decker bus, then set sail for Liberty Island on a guided harbor cruise. This combo package gives you the best of two iconic NYC experiences at a fraction of the price of booking separately.</p>',
 'Night tour departs 9PM. Day cruise departs 10AM. Valid for separate days.',
 '["Double-decker night bus","Statue of Liberty cruise","Harbor views","Expert narration","Combo savings"]',
 3,2,59.00,26.28,'USD',389,2000,4,4.6,445,2890,180,false,
 NOW() - INTERVAL '12 days', NOW() + INTERVAL '48 days', NOW()-INTERVAL '12 days',NOW()),

-- 10. Catalina Flyer — Round Trip Ferry (LA)
('30000000-0000-0000-0000-000000000010',
 '20000000-0000-0000-0000-000000000009',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='things-to-do'),
 'Catalina Island Ferry Ticket — Round Trip on The Catalina Flyer',
 'catalina-flyer-round-trip-ferry',
 'Zip across the Pacific to beautiful Catalina Island on the fastest catamaran ferry in Southern California.',
 '<p>The Catalina Flyer is a 500-passenger high-speed catamaran that whisks you to Catalina Island in just 75 minutes from Newport Beach. Enjoy stunning ocean views, snorkeling, hiking, dining, and the charming town of Avalon.</p>',
 'Round-trip fare. Seasonal schedule. Subject to weather. Bikes allowed for additional fee.',
 '["75-minute crossing","High-speed catamaran","Stunning ocean views","Avalon day trip","Multiple daily departures"]',
 1,2,94.00,53.10,'USD',1780,10000,4,4.7,1024,9800,180,true,
 NOW() - INTERVAL '30 days', NOW() + INTERVAL '90 days', NOW()-INTERVAL '30 days',NOW()),

-- 11. Valvoline — Oil Change (LA)
('30000000-0000-0000-0000-000000000011',
 '20000000-0000-0000-0000-000000000010',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='auto-home'),
 'Valvoline Instant Oil Change — Conventional or Synthetic',
 'valvoline-instant-oil-change-los-angeles',
 'Fast, professional oil change while you stay in your car — no appointment needed across LA.',
 '<p>Valvoline Instant Oil Change keeps your vehicle running at peak performance. Trained technicians perform a complete oil change and 18-point inspection while you stay comfortable in your car — in about 15 minutes.</p>',
 'Coupon applies to one vehicle. Cannot combine with other offers. Valid at participating LA locations.',
 '["Stay in your car","~15 minute service","18-point inspection","No appointment needed","Conventional or synthetic"]',
 0,2,58.99,35.39,'USD',2134,20000,3,4.3,2134,14200,90,false,
 NOW() - INTERVAL '45 days', NOW() + INTERVAL '45 days', NOW()-INTERVAL '45 days',NOW()),

-- 12. Great Wolf Lodge Chicago — Suite + Water Park
('30000000-0000-0000-0000-000000000012',
 '20000000-0000-0000-0000-000000000011',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='travel'),
 'Great Wolf Lodge Chicago — Suite Stay with Water Park Access',
 'great-wolf-lodge-chicago-suite-water-park',
 'Family resort fun with indoor water park passes included in your suite stay — no extra charge.',
 '<p>Great Wolf Lodge in Gurnee, IL is the ultimate family resort just 40 miles north of Chicago. Every suite includes daily water park access for your entire party featuring waterslides, a lazy river, activity pool, and kids'' splash pad.</p>',
 'Weekend pricing may vary. Water park for registered guests only. Children under 2 free.',
 '["Indoor water park included","Themed family suites","Multiple slide options","Lazy river","No extra fees"]',
 1,2,303.90,120.84,'USD',1872,8000,2,4.5,1872,12400,90,true,
 NOW() - INTERVAL '6 days', NOW() + INTERVAL '60 days', NOW()-INTERVAL '6 days',NOW()),

-- 13. Great Wolf Lodge Minnesota — Suite + Water Park
('30000000-0000-0000-0000-000000000013',
 '20000000-0000-0000-0000-000000000011',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='travel'),
 'Great Wolf Lodge Minnesota — Waterpark Suites for the Whole Family',
 'great-wolf-lodge-minnesota-suite-water-park',
 'Midwest family getaway with indoor waterpark passes included — perfect for cold-weather escapes.',
 '<p>Great Wolf Lodge in Bloomington, MN offers the legendary indoor waterpark experience minutes from Mall of America. Book a themed suite and enjoy unlimited daily water park access for your entire party year-round.</p>',
 'Weekend premium pricing applies. Book in advance for best availability.',
 '["Year-round waterpark","Near Mall of America","Themed suites","Daily access included","MagiQuest game"]',
 1,2,347.90,120.84,'USD',634,4000,2,4.5,634,4100,90,false,
 NOW() - INTERVAL '4 days', NOW() + INTERVAL '56 days', NOW()-INTERVAL '4 days',NOW()),

-- 14. Warwick Allerton Hotel — Chicago
('30000000-0000-0000-0000-000000000014',
 '20000000-0000-0000-0000-000000000013',
 (SELECT "Id" FROM "Categories" WHERE "Slug"='travel'),
 'Warwick Allerton Chicago — Magnificent Mile Stay (Kids Stay Free)',
 'warwick-allerton-chicago-magnificent-mile',
 'Historic boutique hotel in the heart of Chicago''s Magnificent Mile — kids stay free.',
 '<p>The Warwick Allerton Chicago is a landmark 1924 hotel on Michigan Avenue. Steps from world-class shopping, dining, and attractions. All rates are all-inclusive with no hidden resort fees. Kids under 18 stay free.</p>',
 'All-inclusive rate — no resort fees. Kids under 18 stay free. Standard cancellation policy.',
 '["All-inclusive pricing","No resort fees","Kids stay free","Prime Magnificent Mile location","Historic 1924 building"]',
 1,2,125.77,76.60,'USD',456,3000,2,4.4,456,3200,90,false,
 NOW() - INTERVAL '9 days', NOW() + INTERVAL '51 days', NOW()-INTERVAL '9 days',NOW());

-- ── Deal Options ─────────────────────────────────────────────
-- SoldQty, IsActive, SortOrder are required
INSERT INTO "DealOptions" ("Id","DealId","Title","Description","Price","AvailableQty","SoldQty","IsActive","SortOrder","CreatedAt","UpdatedAt") VALUES
-- Deal 1: Derma Bliss
('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Small Area (Underarms or Lip)','6 sessions for underarm or lip area',103.50,200,0,true,1,NOW(),NOW()),
('40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','Medium Area (Bikini or Chin)','6 sessions for bikini or chin area',149.00,150,0,true,2,NOW(),NOW()),
('40000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000001','Large Area (Full Legs or Back)','6 sessions for legs or back',229.00,100,0,true,3,NOW(),NOW()),

-- Deal 2: Pure Serenity Spa
('40000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000002','60-Min Solo Massage','Single session 60-minute massage',80.10,100,0,true,1,NOW(),NOW()),
('40000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000002','90-Min Solo Massage','Single session 90-minute massage',109.00,80,0,true,2,NOW(),NOW()),
('40000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000002','60-Min Couples Massage','Side-by-side 60-minute couples massage',155.00,40,0,true,3,NOW(),NOW()),
('40000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000002','90-Min Couples Massage','Side-by-side 90-minute couples massage',199.00,30,0,true,4,NOW(),NOW()),

-- Deal 5: Massage House
('40000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000005','60-Min Swedish Massage','Relaxing 60-minute Swedish session',94.77,80,0,true,1,NOW(),NOW()),
('40000000-0000-0000-0000-000000000009','30000000-0000-0000-0000-000000000005','90-Min Hot Stone Massage','90-minute hot stone therapy session',134.00,60,0,true,2,NOW(),NOW()),

-- Deal 12: Great Wolf Lodge Chicago
('40000000-0000-0000-0000-000000000010','30000000-0000-0000-0000-000000000012','Standard Suite (Sun–Thu)','Weeknight stay with water park access',120.84,500,0,true,1,NOW(),NOW()),
('40000000-0000-0000-0000-000000000011','30000000-0000-0000-0000-000000000012','Standard Suite (Fri–Sat)','Weekend stay with water park access',169.00,300,0,true,2,NOW(),NOW()),
('40000000-0000-0000-0000-000000000012','30000000-0000-0000-0000-000000000012','Wolf Den Suite (Bunk Beds)','Themed suite with bunk beds + water park',210.00,200,0,true,3,NOW(),NOW()),

-- Deal 14: Warwick Allerton
('40000000-0000-0000-0000-000000000013','30000000-0000-0000-0000-000000000014','1 Night Stay','One night, kids stay free',76.60,200,0,true,1,NOW(),NOW()),
('40000000-0000-0000-0000-000000000014','30000000-0000-0000-0000-000000000014','2 Night Package','Two nights, 10% additional discount',139.00,150,0,true,2,NOW(),NOW());

-- ── Deal Images ──────────────────────────────────────────────
INSERT INTO "DealImages" ("Id","DealId","Url","AltText","IsPrimary","SortOrder","CreatedAt","UpdatedAt") VALUES
('50000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800','Laser hair removal treatment',true,1,NOW(),NOW()),
('50000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800','Spa treatment room',false,2,NOW(),NOW()),

('50000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000002','https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800','Couples massage session',true,1,NOW(),NOW()),
('50000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000002','https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800','Hot stone massage',false,2,NOW(),NOW()),

('50000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000003','https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800','Korean spa sauna interior',true,1,NOW(),NOW()),
('50000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000003','https://images.unsplash.com/photo-1510021711994-93f8f22ea147?w=800','Spa relaxation area',false,2,NOW(),NOW()),

('50000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000004','https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800','Luxury spa facial',true,1,NOW(),NOW()),
('50000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000004','https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800','Hotel spa manicure',false,2,NOW(),NOW()),

('50000000-0000-0000-0000-000000000009','30000000-0000-0000-0000-000000000005','https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800','Massage therapy room',true,1,NOW(),NOW()),

('50000000-0000-0000-0000-000000000010','30000000-0000-0000-0000-000000000006','https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800','Chicago Architecture Boat Tour',true,1,NOW(),NOW()),
('50000000-0000-0000-0000-000000000011','30000000-0000-0000-0000-000000000006','https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800','Chicago River skyline',false,2,NOW(),NOW()),
('50000000-0000-0000-0000-000000000012','30000000-0000-0000-0000-000000000006','https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800','Chicago architecture detail',false,3,NOW(),NOW()),

('50000000-0000-0000-0000-000000000013','30000000-0000-0000-0000-000000000007','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800','Bared Monkey laser spa NYC',true,1,NOW(),NOW()),

('50000000-0000-0000-0000-000000000014','30000000-0000-0000-0000-000000000008','https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800','Infinity laser spa unlimited membership',true,1,NOW(),NOW()),

('50000000-0000-0000-0000-000000000015','30000000-0000-0000-0000-000000000009','https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?w=800','Statue of Liberty NYC',true,1,NOW(),NOW()),
('50000000-0000-0000-0000-000000000016','30000000-0000-0000-0000-000000000009','https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800','NYC night bus tour skyline',false,2,NOW(),NOW()),

('50000000-0000-0000-0000-000000000017','30000000-0000-0000-0000-000000000010','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800','Catalina Island beach',true,1,NOW(),NOW()),
('50000000-0000-0000-0000-000000000018','30000000-0000-0000-0000-000000000010','https://images.unsplash.com/photo-1566659436593-73636a3680fc?w=800','Catalina Flyer ferry',false,2,NOW(),NOW()),

('50000000-0000-0000-0000-000000000019','30000000-0000-0000-0000-000000000011','https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800','Valvoline oil change service',true,1,NOW(),NOW()),

('50000000-0000-0000-0000-000000000020','30000000-0000-0000-0000-000000000012','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800','Great Wolf Lodge indoor water park',true,1,NOW(),NOW()),
('50000000-0000-0000-0000-000000000021','30000000-0000-0000-0000-000000000012','https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800','Water park slides family',false,2,NOW(),NOW()),

('50000000-0000-0000-0000-000000000022','30000000-0000-0000-0000-000000000013','https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800','Great Wolf Lodge Minnesota',true,1,NOW(),NOW()),

('50000000-0000-0000-0000-000000000023','30000000-0000-0000-0000-000000000014','https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800','Warwick Allerton hotel exterior',true,1,NOW(),NOW()),
('50000000-0000-0000-0000-000000000024','30000000-0000-0000-0000-000000000014','https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800','Hotel room interior',false,2,NOW(),NOW());

-- ── Verification ─────────────────────────────────────────────
SELECT tbl, cnt FROM (
  SELECT 'Categories'  AS tbl, COUNT(*)::text AS cnt FROM "Categories"
  UNION ALL SELECT 'Users',       COUNT(*)::text FROM "Users"
  UNION ALL SELECT 'Vendors',     COUNT(*)::text FROM "Vendors"
  UNION ALL SELECT 'Deals',       COUNT(*)::text FROM "Deals"
  UNION ALL SELECT 'DealOptions', COUNT(*)::text FROM "DealOptions"
  UNION ALL SELECT 'DealImages',  COUNT(*)::text FROM "DealImages"
) t ORDER BY tbl;
