import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'İlyas Akın - Senior Full-Stack Web Developer'
export const size = {
  width: 1200,
  height: 630,
}

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom, #000000, #1a1a1a)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <h1
          style={{
            fontSize: 60,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'white',
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          İlyas Akın
        </h1>
        <p
          style={{
            fontSize: 30,
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
          }}
        >
          Senior Full-Stack Web Developer
        </p>
      </div>
    ),
    {
      ...size,
    }
  )
} 