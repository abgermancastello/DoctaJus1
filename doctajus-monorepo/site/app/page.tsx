import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Scale, Calendar, FileText, Users, ChevronRight, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">DoctaJus</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600">
              Características
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-blue-600">
              Testimonios
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-blue-600">
              Precios
            </Link>
            <Link href="#contact" className="text-sm font-medium text-gray-600 hover:text-blue-600">
              Contacto
            </Link>
          </nav>
          <div>
            <Button variant="outline" className="mr-2 hidden md:inline-flex">
              Registrarse
            </Button>
            <Button>
              Ingresar a la App
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white opacity-70 -z-10"></div>
          <div className="absolute inset-0 overflow-hidden -z-10">
            <svg className="absolute right-0 top-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
              <path
                d="M0,0 C300,100 400,300 1000,50 L1000,1000 L0,1000 Z"
                fill="url(#header-gradient)"
                fillOpacity="0.1"
              ></path>
              <defs>
                <linearGradient id="header-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="container px-4 md:px-6 py-16 md:py-24 lg:py-32">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Organizá tu estudio jurídico con DoctaJus
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Gestiona casos, tareas, clientes y audiencias de manera sencilla y eficiente con nuestra plataforma integral para profesionales del derecho.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Ingresar a la App
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Solicitar Demo
                  </Button>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 relative">
                <div className="relative flex items-center justify-center">
                  <div className="absolute -top-4 -left-4 h-72 w-72 bg-blue-100 rounded-full blur-3xl opacity-70"></div>
                  <div className="relative">
                    <Image
                      src="/placeholder.svg?height=600&width=800"
                      width={600}
                      height={400}
                      alt="DoctaJus Dashboard Preview"
                      className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center shadow-2xl"
                    />
                    <div className="absolute -bottom-10 -right-10 w-48 h-auto">
                      <Image
                        src="/placeholder.svg?height=300&width=150"
                        width={150}
                        height={300}
                        alt="DoctaJus Mobile App"
                        className="rounded-xl shadow-xl border border-gray-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-white py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">
                  Características
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Todo lo que necesitas en un solo lugar
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  DoctaJus reúne todas las herramientas que necesitas para administrar tu estudio jurídico de manera eficiente.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li className="flex gap-4 items-start">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Gestión de Casos</h3>
                      <p className="text-gray-500">
                        Organiza todos tus casos con expedientes digitales, seguimiento de plazos y documentación centralizada.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Calendario de Audiencias</h3>
                      <p className="text-gray-500">
                        Nunca pierdas una fecha importante con nuestro sistema de recordatorios y calendario integrado.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Gestión de Clientes</h3>
                      <p className="text-gray-500">
                        Mantén toda la información de tus clientes organizada y accesible en un solo lugar.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <Image
                src="/placeholder.svg?height=600&width=600"
                width={600}
                height={600}
                alt="DoctaJus Features"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover object-center shadow-xl"
              />
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">
                    Productividad
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Optimiza tu tiempo y recursos
                  </h2>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    DoctaJus te permite automatizar tareas repetitivas, reducir errores y enfocarte en lo que realmente importa: tus clientes y casos.
                  </p>
                </div>
                <ul className="grid gap-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span>Ahorra hasta 15 horas semanales en tareas administrativas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span>Reduce errores en la gestión de plazos y vencimientos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span>Accede a toda la información desde cualquier dispositivo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span>Mejora la comunicación con clientes y colaboradores</span>
                  </li>
                </ul>
                <div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Conocer más
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -z-10 h-full w-full bg-gradient-to-r from-blue-50 to-transparent rounded-2xl"></div>
                <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">Estadísticas de productividad</h3>
                      <p className="text-sm text-gray-500">Estudios jurídicos que utilizan DoctaJus</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="text-3xl font-bold text-blue-600">85%</div>
                        <p className="text-sm text-gray-500">Reducción de errores administrativos</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="text-3xl font-bold text-blue-600">40%</div>
                        <p className="text-sm text-gray-500">Aumento en la satisfacción de clientes</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="text-3xl font-bold text-blue-600">30%</div>
                        <p className="text-sm text-gray-500">Incremento en la capacidad de gestión de casos</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="text-3xl font-bold text-blue-600">20h</div>
                        <p className="text-sm text-gray-500">Ahorro semanal promedio en tiempo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="bg-white py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">
                  Testimonios
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Lo que dicen nuestros usuarios
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Descubre cómo DoctaJus ha transformado la gestión de estudios jurídicos en toda Latinoamérica.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-100"></div>
                    <div>
                      <h3 className="font-semibold">Dra. María Fernández</h3>
                      <p className="text-sm text-gray-500">Estudio Jurídico Fernández & Asociados</p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    "DoctaJus ha revolucionado la forma en que gestionamos nuestros casos. La organización y eficiencia que hemos logrado es impresionante."
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-100"></div>
                    <div>
                      <h3 className="font-semibold">Dr. Carlos Mendoza</h3>
                      <p className="text-sm text-gray-500">Mendoza Abogados</p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    "Desde que implementamos DoctaJus, hemos reducido drásticamente el tiempo dedicado a tareas administrativas y podemos enfocarnos más en nuestros clientes."
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-100"></div>
                    <div>
                      <h3 className="font-semibold">Dra. Laura Sánchez</h3>
                      <p className="text-sm text-gray-500">Consultora Legal Independiente</p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    "Como profesional independiente, DoctaJus me ha permitido competir con grandes estudios gracias a la eficiencia y profesionalismo que me brinda la plataforma."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-600 py-16 md:py-24 text-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Comienza a transformar tu estudio jurídico hoy mismo
                </h2>
                <p className="text-blue-100 md:text-xl/relaxed">
                  Únete a cientos de profesionales que ya optimizaron su práctica legal con DoctaJus.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Ingresar a la App
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-700">
                  Solicitar Demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-gray-50 border-t py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Scale className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold">DoctaJus</span>
              </div>
              <p className="text-sm text-gray-500">
                La plataforma integral para la gestión de estudios jurídicos en Latinoamérica.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium">Producto</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-blue-600">Características</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Precios</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Integraciones</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Actualizaciones</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium">Recursos</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-blue-600">Blog</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Guías</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Soporte</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Webinars</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium">Empresa</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-blue-600">Sobre nosotros</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Contacto</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Términos de servicio</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Política de privacidad</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} DoctaJus. Todos los derechos reservados.
            </p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <Link href="#" className="text-gray-500 hover:text-blue-600">
                <span className="sr-only">Twitter</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-600">
                <span className="sr-only">LinkedIn</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-600">
                <span className="sr-only">Instagram</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
