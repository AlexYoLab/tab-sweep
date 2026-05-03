import { createCanvas } from 'canvas'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create icons at different sizes
const sizes = [16, 48, 128]

sizes.forEach(size => {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  
  // Background
  ctx.fillStyle = '#4CAF50'
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.15)
  ctx.fill()
  
  // Tab 1 (being swept) - orange
  const tabWidth = size * 0.4
  const tabHeight = size * 0.3
  const tab1X = size * 0.15
  const tab1Y = size * 0.25
  
  ctx.fillStyle = 'rgba(255, 152, 0, 0.8)'
  ctx.beginPath()
  ctx.roundRect(tab1X, tab1Y, tabWidth, tabHeight, size * 0.05)
  ctx.fill()
  
  // Tab 1 corner
  ctx.beginPath()
  ctx.moveTo(tab1X + tabWidth, tab1Y)
  ctx.lineTo(tab1X + tabWidth + size * 0.04, tab1Y + size * 0.04)
  ctx.lineTo(tab1X + tabWidth, tab1Y + size * 0.08)
  ctx.fill()
  
  // Tab 2 (clean) - blue
  const tab2X = size * 0.4
  const tab2Y = size * 0.45
  
  ctx.fillStyle = 'rgba(33, 150, 243, 0.8)'
  ctx.beginPath()
  ctx.roundRect(tab2X, tab2Y, tabWidth, tabHeight, size * 0.05)
  ctx.fill()
  
  // Tab 2 corner
  ctx.beginPath()
  ctx.moveTo(tab2X + tabWidth, tab2Y)
  ctx.lineTo(tab2X + tabWidth + size * 0.04, tab2Y + size * 0.04)
  ctx.lineTo(tab2X + tabWidth, tab2Y + size * 0.08)
  ctx.fill()
  
  // Broom handle
  ctx.strokeStyle = 'white'
  ctx.lineWidth = size * 0.03
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(size * 0.65, tab2Y + tabHeight)
  ctx.lineTo(size * 0.73, tab2Y + tabHeight + size * 0.15)
  ctx.stroke()
  
  // Broom bristles
  ctx.beginPath()
  ctx.moveTo(size * 0.73, tab2Y + tabHeight + size * 0.15)
  ctx.lineTo(size * 0.67, tab2Y + tabHeight + size * 0.2)
  ctx.moveTo(size * 0.73, tab2Y + tabHeight + size * 0.15)
  ctx.lineTo(size * 0.73, tab2Y + tabHeight + size * 0.2)
  ctx.moveTo(size * 0.73, tab2Y + tabHeight + size * 0.15)
  ctx.lineTo(size * 0.79, tab2Y + tabHeight + size * 0.2)
  ctx.stroke()
  
  // Checkmark circle
  const checkX = size * 0.27
  const checkY = size * 0.7
  const checkR = size * 0.09
  
  ctx.fillStyle = '#4CAF50'
  ctx.beginPath()
  ctx.arc(checkX, checkY, checkR, 0, Math.PI * 2)
  ctx.fill()
  
  // Checkmark
  ctx.strokeStyle = 'white'
  ctx.lineWidth = size * 0.02
  ctx.beginPath()
  ctx.moveTo(checkX - checkR * 0.3, checkY)
  ctx.lineTo(checkX - checkR * 0.1, checkY + checkR * 0.2)
  ctx.lineTo(checkX + checkR * 0.4, checkY - checkR * 0.3)
  ctx.stroke()
  
  // Save to file
  const buffer = canvas.toBuffer('image/png')
  const filename = path.join(__dirname, 'extension/icons', `icon${size}.png`)
  fs.writeFileSync(filename, buffer)
  console.log(`Created: ${filename}`)
})

console.log('All icons created successfully!')
