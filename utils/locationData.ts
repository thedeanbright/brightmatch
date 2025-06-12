// Location data for cascading dropdowns
export interface Country {
  code: string;
  name: string;
  states: State[];
}

export interface State {
  code: string;
  name: string;
  cities: string[];
}

export const LOCATION_DATA: Country[] = [
  {
    code: 'US',
    name: 'United States',
    states: [
      {
        code: 'CA',
        name: 'California',
        cities: [
          'Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Fresno',
          'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim',
          'Santa Ana', 'Riverside', 'Stockton', 'Irvine', 'Fremont'
        ]
      },
      {
        code: 'NY',
        name: 'New York',
        cities: [
          'New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse',
          'Albany', 'New Rochelle', 'Mount Vernon', 'Schenectady', 'Utica',
          'White Plains', 'Troy', 'Niagara Falls', 'Binghamton', 'Rome'
        ]
      },
      {
        code: 'TX',
        name: 'Texas',
        cities: [
          'Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth',
          'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Laredo',
          'Lubbock', 'Garland', 'Irving', 'Amarillo', 'Grand Prairie'
        ]
      },
      {
        code: 'FL',
        name: 'Florida',
        cities: [
          'Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg',
          'Hialeah', 'Tallahassee', 'Fort Lauderdale', 'Port St. Lucie', 'Cape Coral',
          'Pembroke Pines', 'Hollywood', 'Miramar', 'Gainesville', 'Coral Springs'
        ]
      },
      {
        code: 'IL',
        name: 'Illinois',
        cities: [
          'Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville',
          'Springfield', 'Peoria', 'Elgin', 'Waukegan', 'Cicero',
          'Champaign', 'Bloomington', 'Arlington Heights', 'Evanston', 'Decatur'
        ]
      },
      {
        code: 'WA',
        name: 'Washington',
        cities: [
          'Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue',
          'Kent', 'Everett', 'Renton', 'Yakima', 'Federal Way',
          'Spokane Valley', 'Bellingham', 'Kennewick', 'Auburn', 'Pasco'
        ]
      },
      {
        code: 'MA',
        name: 'Massachusetts',
        cities: [
          'Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell',
          'Brockton', 'Quincy', 'Lynn', 'Fall River', 'Newton',
          'Lawrence', 'Somerville', 'Framingham', 'Haverhill', 'Waltham'
        ]
      }
    ]
  },
  {
    code: 'CA',
    name: 'Canada',
    states: [
      {
        code: 'ON',
        name: 'Ontario',
        cities: [
          'Toronto', 'Ottawa', 'Hamilton', 'London', 'Kitchener',
          'Windsor', 'Oshawa', 'Barrie', 'Guelph', 'Kingston',
          'Thunder Bay', 'Sudbury', 'Peterborough', 'Brantford', 'Sault Ste. Marie'
        ]
      },
      {
        code: 'QC',
        name: 'Quebec',
        cities: [
          'Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil',
          'Sherbrooke', 'Saguenay', 'Trois-Rivières', 'Terrebonne', 'Saint-Jean-sur-Richelieu',
          'Repentigny', 'Brossard', 'Drummondville', 'Saint-Jérôme', 'Granby'
        ]
      },
      {
        code: 'BC',
        name: 'British Columbia',
        cities: [
          'Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Abbotsford',
          'Coquitlam', 'Victoria', 'Saanich', 'Delta', 'Kelowna',
          'Langley', 'Kamloops', 'Nanaimo', 'Prince George', 'Chilliwack'
        ]
      }
    ]
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    states: [
      {
        code: 'ENG',
        name: 'England',
        cities: [
          'London', 'Birmingham', 'Manchester', 'Liverpool', 'Leeds',
          'Sheffield', 'Bristol', 'Newcastle', 'Nottingham', 'Leicester',
          'Coventry', 'Bradford', 'Stoke-on-Trent', 'Wolverhampton', 'Plymouth'
        ]
      },
      {
        code: 'SCT',
        name: 'Scotland',
        cities: [
          'Glasgow', 'Edinburgh', 'Aberdeen', 'Dundee', 'Stirling',
          'Perth', 'Inverness', 'Paisley', 'East Kilbride', 'Livingston',
          'Hamilton', 'Cumbernauld', 'Kirkcaldy', 'Dunfermline', 'Ayr'
        ]
      }
    ]
  },
  {
    code: 'AU',
    name: 'Australia',
    states: [
      {
        code: 'NSW',
        name: 'New South Wales',
        cities: [
          'Sydney', 'Newcastle', 'Wollongong', 'Maitland', 'Albury',
          'Wagga Wagga', 'Port Macquarie', 'Tamworth', 'Orange', 'Dubbo',
          'Queanbeyan', 'Bowral', 'Nowra', 'Bathurst', 'Lismore'
        ]
      },
      {
        code: 'VIC',
        name: 'Victoria',
        cities: [
          'Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton',
          'Warrnambool', 'Wodonga', 'Traralgon', 'Mildura', 'Frankston',
          'Sunbury', 'Pakenham', 'Cranbourne', 'Melton', 'Werribee'
        ]
      }
    ]
  }
];

export const INTERESTS_LIST = [
  // Lifestyle & Hobbies
  'Travel', 'Photography', 'Cooking', 'Baking', 'Gardening', 'Reading', 'Writing',
  'Blogging', 'Journaling', 'Collecting', 'Crafting', 'DIY Projects', 'Interior Design',
  'Fashion', 'Shopping', 'Thrifting', 'Vintage', 'Minimalism', 'Sustainability',
  
  // Sports & Fitness
  'Running', 'Cycling', 'Swimming', 'Yoga', 'Pilates', 'CrossFit', 'Weightlifting',
  'Rock Climbing', 'Hiking', 'Camping', 'Skiing', 'Snowboarding', 'Surfing',
  'Tennis', 'Basketball', 'Soccer', 'Baseball', 'Football', 'Golf', 'Martial Arts',
  
  // Arts & Culture
  'Painting', 'Drawing', 'Sculpture', 'Pottery', 'Music', 'Singing', 'Dancing',
  'Theater', 'Movies', 'TV Shows', 'Documentaries', 'Museums', 'Art Galleries',
  'Concerts', 'Festivals', 'Stand-up Comedy', 'Poetry', 'Literature',
  
  // Technology & Science
  'Programming', 'Web Development', 'App Development', 'Gaming', 'Board Games',
  'Video Games', 'Virtual Reality', 'Artificial Intelligence', 'Robotics',
  'Astronomy', 'Physics', 'Chemistry', 'Biology', 'Environmental Science',
  
  // Food & Drink
  'Wine Tasting', 'Beer Brewing', 'Coffee', 'Tea', 'Cocktails', 'Fine Dining',
  'Street Food', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Food Trucks',
  'Farmers Markets', 'Organic Food', 'International Cuisine',
  
  // Social & Community
  'Volunteering', 'Charity Work', 'Community Service', 'Mentoring', 'Teaching',
  'Public Speaking', 'Networking', 'Politics', 'Social Justice', 'Activism',
  'Environmental Causes', 'Animal Rights', 'Human Rights',
  
  // Learning & Growth
  'Languages', 'Philosophy', 'Psychology', 'History', 'Archaeology', 'Anthropology',
  'Economics', 'Business', 'Entrepreneurship', 'Investing', 'Real Estate',
  'Personal Development', 'Meditation', 'Mindfulness', 'Spirituality',
  
  // Adventure & Outdoors
  'Backpacking', 'Road Trips', 'Adventure Sports', 'Extreme Sports', 'Skydiving',
  'Bungee Jumping', 'Paragliding', 'Scuba Diving', 'Snorkeling', 'Fishing',
  'Hunting', 'Wildlife Photography', 'Bird Watching', 'Nature Conservation',
  
  // Entertainment & Media
  'Podcasts', 'Audiobooks', 'YouTube', 'Social Media', 'Influencer Culture',
  'Celebrity Culture', 'Reality TV', 'Anime', 'Comics', 'Graphic Novels',
  'Science Fiction', 'Fantasy', 'Horror', 'Mystery', 'Romance Novels'
];