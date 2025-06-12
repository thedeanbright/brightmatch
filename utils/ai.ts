// Mock AI functions for bio generation and icebreakers
// In a real app, these would call actual AI APIs

export async function generateAIBio(answers: string[]): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const [hobby, personality, looking] = answers;

  const bioTemplates = [
    `${personality} person who loves ${hobby}. ${looking} Let's create some amazing memories together! ✨`,
    `Life's too short for boring conversations! I'm ${personality} and passionate about ${hobby}. ${looking} 🌟`,
    `${personality} soul with a love for ${hobby}. ${looking} Always up for new adventures and meaningful connections! 💫`,
    `They say I'm ${personality}, and I couldn't agree more! When I'm not ${hobby}, you'll find me exploring life's possibilities. ${looking} 🚀`,
    `${personality} by nature, ${hobby} by passion. ${looking} Let's see where this journey takes us! 🎯`
  ];

  return bioTemplates[Math.floor(Math.random() * bioTemplates.length)];
}

export async function generateAIIcebreaker(user1: any, user2: any): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const sharedInterests = user1.interests?.filter((interest: string) => 
    user2.interests?.includes(interest)
  ) || [];

  const icebreakerTemplates = [
    `Hey ${user2.name}! I noticed we both love ${sharedInterests[0] || 'great conversations'} - what's your favorite thing about it?`,
    `Hi there! Your profile really caught my eye. I'd love to know more about your passion for ${user2.interests?.[0] || 'your interests'}!`,
    `${user2.name}! We seem to have a lot in common. What's been the highlight of your week so far?`,
    `Hey! I saw you're into ${sharedInterests[0] || user2.interests?.[0] || 'interesting things'} - I am too! Any recommendations?`,
    `Hi ${user2.name}! Your bio made me smile. I'd love to hear more about your adventures in ${user2.city}!`,
    `What's up! I noticed we're both ${user1.mbti_type && user2.mbti_type ? `${user1.mbti_type}s` : 'similar personalities'} - do you find that affects how you approach ${sharedInterests[0] || 'life'}?`
  ];

  return icebreakerTemplates[Math.floor(Math.random() * icebreakerTemplates.length)];
}