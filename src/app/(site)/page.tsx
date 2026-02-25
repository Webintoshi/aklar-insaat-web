import { getHomePageData } from '@/lib/api/frontend-data'
import { HeroSection } from './_sections/HeroSection'
import { AboutSection } from './_sections/AboutSection'
import { ProjectsSection } from './_sections/ProjectsSection'
import { VideoSection } from './_sections/VideoSection'
import { InfoCardsSection } from './_sections/InfoCardsSection'
import { PreFooter } from './_sections/PreFooter'

export default async function HomePage() {
  const data = await getHomePageData()
  
  return (
    <main>
      <HeroSection data={data.hero} />
      <AboutSection data={data.about} />
      <ProjectsSection projects={data.projects} />
      <VideoSection data={data.video} />
      <InfoCardsSection data={data.infoCards} />
      <PreFooter />
    </main>
  )
}
