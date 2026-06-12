import axios from 'axios'

const client = axios.create({
  baseURL: '/football-api',
  headers: { 'X-Auth-Token': import.meta.env.VITE_FOOTBALL_API_KEY },
})

export async function fetchMatches() {
  const { data } = await client.get('/competitions/WC/matches')
  return data.matches ?? []
}

export async function fetchStandings() {
  const { data } = await client.get('/competitions/WC/standings')
  return data.standings ?? []
}

export async function fetchScorers() {
  const { data } = await client.get('/competitions/WC/scorers?limit=20')
  return data.scorers ?? []
}

export async function fetchTeams() {
  const { data } = await client.get('/competitions/WC/teams')
  return data.teams ?? []
}
