import React, { useState, useEffect, useRef } from 'react';
import { Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import gsap from 'gsap';

const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Reset initial states
      gsap.set([logoRef.current, contentRef.current, formRef.current], { 
        opacity: 0,
        y: 20 
      });

      // Main animation timeline
      const tl = gsap.timeline({
        defaults: { 
          duration: 0.8,
          ease: "power2.out"
        }
      });

      tl.fromTo(logoRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1 }
      )
      .fromTo(contentRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1 },
        "-=0.4"
      )
      .fromTo(formRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1 },
        "-=0.4"
      );

      // Subtle floating animation for the logo
      gsap.to(logoRef.current, {
        y: "+=10",
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(password);
      if (!success) {
        // Error shake animation
        gsap.to(formRef.current, {
          x: [-10, 10, -10, 10, 0],
          duration: 0.5,
          ease: "power2.inOut"
        });
        toast.error('Mot de passe incorrect');
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen w-full bg-gray-50">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left side - Branding */}
        <div className="lg:w-1/2 bg-primary-50 flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-lg w-full">
            <div ref={logoRef} className="flex items-center justify-center lg:justify-start mb-12">
              <Package className="h-16 w-16 text-primary-600" />
              <span className="text-4xl font-bold text-primary-800 ml-4">Kaba</span>
            </div>
            
            <div ref={contentRef} className="text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Plateforme de gestion des livraisons
              </h1>
              <p className="text-lg text-gray-600">
                Gérez vos livraisons, suivez vos colis et optimisez vos opérations depuis une interface unique.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md">
            <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Connexion administrateur
                </h2>
                <p className="text-gray-600">
                  Veuillez vous connecter pour accéder au tableau de bord
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input w-full transition-all duration-300 focus:ring-2 focus:ring-primary-500"
                    placeholder="Entrez votre mot de passe"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;