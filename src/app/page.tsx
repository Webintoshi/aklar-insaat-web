import { getHomePageData, getFooterSettings } from '@/lib/api/frontend-data'
import { Header } from './(site)/_components/Header'
import { AboutSection } from './(site)/_sections/AboutSection'
import { Footer } from './(site)/_sections/Footer'
import { HeroSection } from './(site)/_sections/HeroSection'
import { InfoCardsSection } from './(site)/_sections/InfoCardsSection'
import { ProjectsSection } from './(site)/_sections/ProjectsSection'
import { VideoSection } from './(site)/_sections/VideoSection'

export default async function HomePage() {
  const data = await getHomePageData()
  const footerData = await getFooterSettings()

  return (
    <>
      <Header />
      <main className="pt-[120px]">
        <HeroSection data={data.hero} />
        <AboutSection data={data.about} />
        <ProjectsSection projects={data.projects} />
        <VideoSection data={data.video} />
        <InfoCardsSection data={data.infoCards} />
      </main>
      <Footer data={footerData} />
    </>
  )
}
