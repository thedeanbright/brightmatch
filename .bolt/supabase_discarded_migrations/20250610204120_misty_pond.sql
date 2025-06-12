/*
  # Populate demo users for app showcase

  1. Demo Users
    - 20 realistic profiles with varied data
    - Different cities, ages, interests
    - Balanced IQ/EQ scores
    - Professional photos from Pexels

  2. Data Variety
    - Mix of genders and intents
    - Different locations across US
    - Varied interests and bios
    - Realistic score distributions
*/

-- Insert demo users with realistic data
INSERT INTO users (
  id, email, name, age, gender, city, state, country, 
  iq_score, eq_score, interests, intent, bio, photos, profile_completed
) VALUES 
-- Tech Hub Users (San Francisco)
(
  'demo-user-1', 'emma.chen@demo.com', 'Emma Chen', 26, 'female', 
  'San Francisco', 'CA', 'USA', 128, 142,
  ARRAY['Photography', 'Traveling', 'Coffee', 'Art', 'Technology'],
  'dating',
  'Adventure seeker and coffee enthusiast. Love exploring new places and deep conversations under starry skies. Always up for a weekend hiking trip! ✨',
  ARRAY['https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'],
  true
),
(
  'demo-user-2', 'alex.rodriguez@demo.com', 'Alex Rodriguez', 28, 'male',
  'San Francisco', 'CA', 'USA', 135, 118,
  ARRAY['Technology', 'Music', 'Hiking', 'Gaming', 'Cooking'],
  'dating',
  'Software engineer by day, musician by night. Always up for hiking adventures and trying new restaurants. Let''s build something amazing together! 🎸',
  ARRAY['https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'],
  true
),
(
  'demo-user-3', 'sophia.martinez@demo.com', 'Sophia Martinez', 24, 'female',
  'Los Angeles', 'CA', 'USA', 122, 151,
  ARRAY['Art', 'Yoga', 'Sustainability', 'Cooking', 'Dancing'],
  'dating',
  'Artist and yoga instructor. Passionate about sustainable living and mindful connections. Looking for someone who values creativity and consciousness. 🧘‍♀️',
  ARRAY['https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg', 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg'],
  true
),
(
  'demo-user-4', 'marcus.thompson@demo.com', 'Marcus Thompson', 30, 'male',
  'New York', 'NY', 'USA', 141, 126,
  ARRAY['Business', 'Fitness', 'Travel', 'Wine', 'Reading'],
  'dating',
  'Entrepreneur and fitness enthusiast. Looking for someone who shares my passion for growth and adventure. Life''s too short for boring conversations! 💪',
  ARRAY['https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'],
  true
),
(
  'demo-user-5', 'luna.park@demo.com', 'Luna Park', 27, 'female',
  'Seattle', 'WA', 'USA', 133, 158,
  ARRAY['Psychology', 'Reading', 'Dancing', 'Nature', 'Meditation'],
  'dating',
  'Therapist who loves helping others grow. When I''m not working, you''ll find me dancing or hiking. Seeking genuine connections and meaningful conversations. 🌲',
  ARRAY['https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg', 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg'],
  true
),

-- East Coast Professionals
(
  'demo-user-6', 'james.wilson@demo.com', 'James Wilson', 29, 'male',
  'Boston', 'MA', 'USA', 145, 132,
  ARRAY['Science', 'Research', 'Classical Music', 'Chess', 'Philosophy'],
  'dating',
  'Research scientist with a passion for discovery. Love classical music and deep philosophical discussions. Looking for an intellectual equal! 🔬',
  ARRAY['https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg', 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg'],
  true
),
(
  'demo-user-7', 'maya.patel@demo.com', 'Maya Patel', 25, 'female',
  'Washington', 'DC', 'USA', 139, 165,
  ARRAY['Politics', 'Social Justice', 'Writing', 'Yoga', 'Travel'],
  'dating',
  'Policy analyst by day, activist by heart. Passionate about making the world a better place. Seeking someone who cares about social impact. ✊',
  ARRAY['https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg', 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg'],
  true
),
(
  'demo-user-8', 'david.kim@demo.com', 'David Kim', 31, 'male',
  'Miami', 'FL', 'USA', 127, 144,
  ARRAY['Finance', 'Surfing', 'Photography', 'Travel', 'Food'],
  'dating',
  'Financial advisor who loves the ocean. When I''m not crunching numbers, I''m catching waves. Looking for someone to share adventures with! 🏄‍♂️',
  ARRAY['https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg', 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg'],
  true
),

-- Creative Types
(
  'demo-user-9', 'zoe.anderson@demo.com', 'Zoe Anderson', 23, 'female',
  'Austin', 'TX', 'USA', 118, 149,
  ARRAY['Music', 'Art', 'Festivals', 'Vintage', 'Photography'],
  'dating',
  'Indie musician and vintage lover. Austin''s music scene is my playground. Looking for someone who appreciates art and authentic experiences. 🎵',
  ARRAY['https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg', 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg'],
  true
),
(
  'demo-user-10', 'ryan.cooper@demo.com', 'Ryan Cooper', 27, 'male',
  'Portland', 'OR', 'USA', 131, 138,
  ARRAY['Craft Beer', 'Hiking', 'Sustainability', 'Cooking', 'Biking'],
  'dating',
  'Craft brewer and sustainability advocate. Portland''s my kind of city - weird and wonderful. Let''s explore the Pacific Northwest together! 🍺',
  ARRAY['https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg', 'https://images.pexels.com/photos/1040882/pexels-photo-1040882.jpeg'],
  true
),

-- Midwest Charm
(
  'demo-user-11', 'sarah.johnson@demo.com', 'Sarah Johnson', 26, 'female',
  'Chicago', 'IL', 'USA', 134, 156,
  ARRAY['Architecture', 'Food', 'Theater', 'Running', 'Books'],
  'dating',
  'Architect who loves Chicago''s skyline. Passionate about design and great food. Looking for someone to explore the city''s hidden gems with! 🏗️',
  ARRAY['https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg', 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg'],
  true
),
(
  'demo-user-12', 'mike.davis@demo.com', 'Mike Davis', 28, 'male',
  'Denver', 'CO', 'USA', 129, 141,
  ARRAY['Skiing', 'Mountain Biking', 'Craft Beer', 'Photography', 'Hiking'],
  'dating',
  'Outdoor enthusiast who lives for powder days. Denver''s my basecamp for Rocky Mountain adventures. Seeking a partner in crime for epic journeys! ⛷️',
  ARRAY['https://images.pexels.com/photos/1043475/pexels-photo-1043475.jpeg', 'https://images.pexels.com/photos/1040883/pexels-photo-1040883.jpeg'],
  true
),

-- Southern Hospitality
(
  'demo-user-13', 'grace.williams@demo.com', 'Grace Williams', 25, 'female',
  'Nashville', 'TN', 'USA', 125, 152,
  ARRAY['Country Music', 'Songwriting', 'Horses', 'Cooking', 'Dancing'],
  'dating',
  'Singer-songwriter in Music City. Love horses, honky-tonks, and heartfelt lyrics. Looking for someone who appreciates authentic country living! 🤠',
  ARRAY['https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg', 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg'],
  true
),
(
  'demo-user-14', 'tyler.brown@demo.com', 'Tyler Brown', 30, 'male',
  'Atlanta', 'GA', 'USA', 136, 128,
  ARRAY['Business', 'Golf', 'BBQ', 'Sports', 'Travel'],
  'dating',
  'Sales executive with Southern charm. Love good BBQ and better company. Looking for someone who can keep up with my ambitious spirit! 🏌️‍♂️',
  ARRAY['https://images.pexels.com/photos/1043476/pexels-photo-1043476.jpeg', 'https://images.pexels.com/photos/1040884/pexels-photo-1040884.jpeg'],
  true
),

-- West Coast Vibes
(
  'demo-user-15', 'chloe.garcia@demo.com', 'Chloe Garcia', 24, 'female',
  'San Diego', 'CA', 'USA', 121, 147,
  ARRAY['Surfing', 'Yoga', 'Marine Biology', 'Beach Volleyball', 'Sustainability'],
  'dating',
  'Marine biologist who''s passionate about ocean conservation. San Diego beaches are my office! Seeking someone who loves the ocean as much as I do. 🌊',
  ARRAY['https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg', 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg'],
  true
),
(
  'demo-user-16', 'noah.miller@demo.com', 'Noah Miller', 29, 'male',
  'Phoenix', 'AZ', 'USA', 132, 135,
  ARRAY['Rock Climbing', 'Desert Photography', 'Astronomy', 'Hiking', 'Meditation'],
  'dating',
  'Rock climbing instructor who finds peace in the desert. Love stargazing and sunrise hikes. Looking for an adventure buddy who appreciates nature''s beauty! 🧗‍♂️',
  ARRAY['https://images.pexels.com/photos/1043477/pexels-photo-1043477.jpeg', 'https://images.pexels.com/photos/1040885/pexels-photo-1040885.jpeg'],
  true
),

-- Friendship Seekers
(
  'demo-user-17', 'jessica.taylor@demo.com', 'Jessica Taylor', 27, 'female',
  'Minneapolis', 'MN', 'USA', 140, 159,
  ARRAY['Book Clubs', 'Volunteering', 'Cooking', 'Board Games', 'Gardening'],
  'friendship',
  'Teacher who loves building community. Always organizing book clubs and volunteer events. Looking for genuine friendships and meaningful connections! 📚',
  ARRAY['https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg', 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'],
  true
),
(
  'demo-user-18', 'kevin.anderson@demo.com', 'Kevin Anderson', 26, 'male',
  'Salt Lake City', 'UT', 'USA', 128, 143,
  ARRAY['Skiing', 'Board Games', 'Craft Beer', 'Hiking', 'Photography'],
  'friendship',
  'Software developer who loves Utah''s outdoor scene. Always down for a ski trip or board game night. Seeking friends who share my love for adventure! 🎿',
  ARRAY['https://images.pexels.com/photos/1043478/pexels-photo-1043478.jpeg', 'https://images.pexels.com/photos/1040886/pexels-photo-1040886.jpeg'],
  true
),

-- High Achievers
(
  'demo-user-19', 'isabella.rodriguez@demo.com', 'Isabella Rodriguez', 28, 'female',
  'San Francisco', 'CA', 'USA', 155, 148,
  ARRAY['AI Research', 'Chess', 'Classical Music', 'Philosophy', 'Wine'],
  'dating',
  'AI researcher pushing the boundaries of machine learning. Love intellectual debates and classical concerts. Seeking someone who challenges my mind! 🤖',
  ARRAY['https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg', 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg'],
  true
),
(
  'demo-user-20', 'ethan.clark@demo.com', 'Ethan Clark', 32, 'male',
  'Boston', 'MA', 'USA', 148, 162,
  ARRAY['Medicine', 'Marathon Running', 'Cooking', 'Travel', 'Mentoring'],
  'dating',
  'Emergency room doctor with a passion for helping others. Marathon runner who believes in pushing limits. Looking for someone who shares my drive for excellence! 🏃‍♂️',
  ARRAY['https://images.pexels.com/photos/1043479/pexels-photo-1043479.jpeg', 'https://images.pexels.com/photos/1040887/pexels-photo-1040887.jpeg'],
  true
);