import { useNavigate, Link } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Building2, User, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('google') === '1') {
      navigate({ to: '/register/company', search: { google: '1' }, state: location.state });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png?v=3" alt="HEYLA" className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
          <p className="text-slate-500 mt-1">Choose how you want to use HEYLAOS</p>
        </div>

        <div className="grid gap-4">
          <button onClick={() => navigate({ to: '/register/individual' })}
            className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-slate-800 mb-1">Individual Account</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Looking for a job or opportunity? Browse vacancies, apply to positions, and build your career.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0 mt-1" />
            </div>
          </button>

          <button onClick={() => navigate({ to: '/register/company' })}
            className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-slate-800 mb-1">Company Account</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Register your business to manage HR, payroll, inventory, post jobs, and grow your enterprise.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0 mt-1" />
            </div>
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
