#!/usr/bin/env node
// Generates public/sitemap.xml by fetching all categories and venues from the API
// Usage: node scripts/generate-sitemap.js
// Run after npm run build or as a separate step

import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://mapedia.org'
const API_BASE = process.env.API_URL || 'https://mapedia.org/api/v1'
const OUT = path.join(__dirname, '../public/sitemap.xml')

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    mod.get(url, res => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

async function fetchAll(endpoint) {
  const items = []
  let url = `${API_BASE}${endpoint}`
  while (url) {
    const data = await fetchJSON(url)
    const results = data.results || data
    items.push(...results)
    url = data.next || null
  }
  return items
}

function xmlEsc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function url(loc, changefreq, priority, lastmod) {
  return [
    '  <url>',
    `    <loc>${xmlEsc(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : '',
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n')
}

async function generate() {
  console.log('Fetching categories...')
  const categories = await fetchAll('/categories/')
  console.log(`  ${categories.length} categories`)

  console.log('Fetching venues...')
  const venues = await fetchAll('/venues/?page_size=100')
  console.log(`  ${venues.length} venues`)

  const today = new Date().toISOString().slice(0, 10)

  const staticUrls = [
    url(`${BASE_URL}/`, 'daily', '1.0', today),
    url(`${BASE_URL}/categories`, 'daily', '0.9', today),
    url(`${BASE_URL}/about`, 'monthly', '0.5'),
    url(`${BASE_URL}/contribute`, 'monthly', '0.6'),
    url(`${BASE_URL}/license`, 'yearly', '0.3'),
    url(`${BASE_URL}/guidelines`, 'yearly', '0.3'),
    url(`${BASE_URL}/privacy`, 'yearly', '0.3'),
    url(`${BASE_URL}/terms`, 'yearly', '0.3'),
  ]

  const categoryUrls = categories.map(c =>
    url(`${BASE_URL}/category/${c.slug}`, 'weekly', '0.8', c.updated_at || today)
  )

  const venueUrls = venues.map(v =>
    url(`${BASE_URL}/venue/${v.slug}`, 'weekly', '0.7', v.updated_at || today)
  )

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticUrls,
    ...categoryUrls,
    ...venueUrls,
    '</urlset>',
  ].join('\n')

  fs.writeFileSync(OUT, xml, 'utf8')
  console.log(`\nSitemap written to ${OUT}`)
  console.log(`Total URLs: ${staticUrls.length + categoryUrls.length + venueUrls.length}`)
}

generate().catch(err => {
  console.error('Sitemap generation failed:', err.message)
  process.exit(1)
})
