import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

const PB = '#0A66FF'
const DN = '#071B4D'
const SB = '#38BDF8'
const LB = '#F4F8FF'

const industries = [
  { name: 'Carpentry & Joinery', icon: '🔨', count: '120+ jobs' },
  { name: 'Electrical Installation', icon: '⚡', count: '200+ jobs' },
  { name: 'Plumbing & Pipe Fitting', icon: '🔧', count: '85+ jobs' },
  { name: 'Masonry & Construction', icon: '🏗️', count: '300+ jobs' },
  { name: 'Welding & Fabrication', icon: '🔥', count: '95+ jobs' },
  { name: 'Solar Installation', icon: '☀️', count: '60+ jobs' },
  { name: 'Automotive Repair', icon: '🚗', count: '75+ jobs' },
  { name: 'ICT & Technical Support', icon: '💻', count: '150+ jobs' },
  { name: 'Refrigeration & AC', icon: '❄️', count: '45+ jobs' },
  { name: 'Painting & Finishing', icon: '🎨', count: '70+ jobs' },
  { name: 'Mechanical Works', icon: '⚙️', count: '110+ jobs' },
  { name: 'Driver & Machine Ops', icon: '🚛', count: '90+ jobs' },
]

export default function NetworkTapLanding() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: LB }}>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? 'bg-white/95 shadow-sm backdrop-blur' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: PB }}>N</div>
            <span className="font-semibold text-lg" style={{ color: DN }}>Network Tap Venture</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: '#64748B' }}>
            <a href="#industries">Skilled Jobs</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors" style={{ borderColor: PB, color: PB }}>Sign In</Link>
            <Link to="/register/individual" className="px-4 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-90" style={{ background: PB }}>Join Free</Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border" style={{ background: 'white', borderColor: '#E2E8F0', color: DN }}>
            Kenya's Professional Platform for Skilled Workers & Students
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: DN }}>
            Build Your Skills.<br />
            <span style={{ color: PB }}>Showcase Your Work. Get Hired.</span>
          </h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto mb-8" style={{ color: '#64748B' }}>
            Kenya's professional platform for students, trainees, artisans, technicians, and skilled workers.
            Create a career-ready profile, generate a professional CV, showcase your projects,
            and find internships, attachments, and blue-collar job opportunities.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <Link to="/register/individual" className="px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all" style={{ background: PB }}>
              Create Free Profile
            </Link>
            <Link to="/network-tap/jobs" className="px-6 py-3 rounded-xl font-semibold border-2 transition-all" style={{ borderColor: PB, color: PB }}>
              Find Skilled Jobs
            </Link>
            <Link to="/network-tap/jobs" className="px-6 py-3 rounded-xl font-semibold border-2 transition-all" style={{ borderColor: '#CBD5E1', color: '#475569' }}>
              Find Internship
            </Link>
            <Link to="/register/company" className="px-6 py-3 rounded-xl font-semibold transition-all" style={{ background: DN, color: 'white' }}>
              Post a Vacancy
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { num: '10K+', label: 'Skilled Workers' },
              { num: '500+', label: 'Employers' },
              { num: '2K+', label: 'Jobs Posted' },
              { num: '95%', label: 'Satisfaction' },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl text-center" style={{ background: 'white', border: '1px solid #E2E8F0' }}>
                <div className="text-2xl font-bold" style={{ color: PB }}>{s.num}</div>
                <div className="text-xs" style={{ color: '#64748B' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="industries" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-2" style={{ color: DN }}>Skilled Jobs & Technical Opportunities</h2>
          <p className="text-center mb-10 max-w-2xl mx-auto" style={{ color: '#64748B' }}>Browse opportunities across Kenya's growing technical and vocational sectors.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {industries.map((ind) => (
              <Link key={ind.name} to="/network-tap/jobs" className="p-4 rounded-xl bg-white border hover:shadow-md hover:border-blue-200 transition-all flex items-center gap-3" style={{ borderColor: '#E2E8F0' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ background: LB }}>{ind.icon}</div>
                <div>
                  <p className="font-medium text-sm" style={{ color: DN }}>{ind.name}</p>
                  <p className="text-xs" style={{ color: PB }}>{ind.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4" style={{ background: 'white' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: DN }}>Why Network Tap Is Different</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border" style={{ borderColor: '#E2E8F0', background: LB }}>
                  <p className="font-semibold text-sm" style={{ color: DN }}>Traditional Job Boards</p>
                  <p className="text-sm mt-1" style={{ color: '#64748B' }}>Only collect CVs with limited proof of skills. Difficult for artisans and technicians to stand out.</p>
                </div>
                {[
                  { title: 'Professional Digital Profiles', desc: 'Complete career profiles that grow with you from student to professional.' },
                  { title: 'Automatic CV Generation', desc: 'Build your profile once, generate ATS-friendly CVs instantly.' },
                  { title: 'Real Project Portfolios', desc: 'Showcase actual work with photos, videos, and client testimonials.' },
                  { title: 'Skills-Based Hiring', desc: 'Employers hire based on demonstrated skills, not just certificates.' },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shrink-0" style={{ background: PB }}>✓</div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: DN }}>{f.title}</p>
                      <p className="text-sm" style={{ color: '#64748B' }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🎓', title: 'Students', desc: 'Build career profiles, get CVs, find internships' },
                { icon: '👷', title: 'Artisans & Technicians', desc: 'Showcase projects, find skilled jobs' },
                { icon: '🏢', title: 'Employers', desc: 'Post jobs, hire skilled workers directly' },
                { icon: '📋', title: 'TVET & Universities', desc: 'Verify trainees, track graduate outcomes' },
              ].map((c) => (
                <div key={c.title} className="p-5 rounded-xl border" style={{ borderColor: '#E2E8F0', background: 'white' }}>
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <p className="font-semibold text-sm" style={{ color: DN }}>{c.title}</p>
                  <p className="text-xs mt-1" style={{ color: '#64748B' }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: DN }}>Your Career Journey Starts Here</h2>
          <p className="mb-12 max-w-xl mx-auto" style={{ color: '#64748B' }}>One platform that grows with you — from student to skilled professional.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Create Profile', desc: 'Sign up in 2 minutes. Add your skills, education, and trade specialization.' },
              { step: '2', title: 'Showcase Work', desc: 'Upload project photos, certifications, and build your professional portfolio.' },
              { step: '3', title: 'Generate CV', desc: 'Create an ATS-friendly CV instantly from your profile data.' },
              { step: '4', title: 'Get Hired', desc: 'Apply to matched jobs, connect with employers, and start working.' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold mx-auto mb-4" style={{ background: PB }}>{item.step}</div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: DN }}>{item.title}</h3>
                <p className="text-sm" style={{ color: '#64748B' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4" style={{ background: 'white' }}>
        <div className="max-w-4xl mx-auto text-center p-12 rounded-2xl" style={{ background: 'linear-gradient(135deg, #071B4D 0%, #0A66FF 100%)', color: 'white' }}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Build Your Career?</h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.9)' }}>Join thousands of Kenyan students, artisans, and skilled workers on Network Tap Venture.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register/individual" className="px-8 py-3.5 rounded-xl bg-white font-semibold text-lg transition-all hover:scale-105" style={{ color: PB }}>
              Create Free Profile
            </Link>
            <Link to="/register/company" className="px-8 py-3.5 rounded-xl border-2 border-white font-semibold text-lg transition-all hover:scale-105">
              Hire Skilled Workers
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t" style={{ borderColor: '#E2E8F0', background: 'white' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: '#64748B' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs" style={{ background: PB }}>N</div>
            <span className="font-medium" style={{ color: DN }}>Network Tap Venture</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <span>&copy; 2026 Network Tap Venture. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
