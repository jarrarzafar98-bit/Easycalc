import React, { useMemo, useState, useEffect } from 'react'

const currencies: Record<string, string> = {
  USA: 'USD',
  Canada: 'CAD',
  Germany: 'EUR',
  Italy: 'EUR',
  UAE: 'AED',
  'Saudi Arabia': 'SAR',
  Qatar: 'QAR',
  Bahrain: 'BHD',
}

const countryRegions: Record<string, string[]> = {
  USA: ['California', 'Texas', 'New York', 'Florida', 'Pennsylvania'],
  Canada: ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
  Germany: ['All Germany'],
  Italy: ['All Italy'],
  UAE: ['Dubai', 'Abu Dhabi'],
  'Saudi Arabia': ['All KSA'],
  Qatar: ['All Qatar'],
  Bahrain: ['All Bahrain'],
}

function formatCurrency(val: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(val)
  } catch {
    return `${currency} ${val.toFixed(2)}`
  }
}

function pmt(rateMonthly: number, nMonths: number, principal: number) {
  if (rateMonthly === 0) return principal / nMonths
  const r = rateMonthly
  return (r * principal) / (1 - Math.pow(1 + r, -nMonths))
}

function amortize(principal: number, rateAnnualPct: number, termMonths: number) {
  const r = rateAnnualPct / 100 / 12
  const pay = pmt(r, termMonths, principal)
  let bal = principal
  const rows: { month: number; interest: number; principal: number; balance: number }[] = []
  for (let m = 1; m <= termMonths; m++) {
    const interest = bal * r
    const principalPaid = Math.min(pay - interest, bal)
    bal = Math.max(0, bal - principalPaid)
    rows.push({ month: m, interest, principal: principalPaid, balance: bal })
    if (bal <= 0) break
  }
  const totalInterest = rows.reduce((s, r) => s + r.interest, 0)
  return { schedule: rows, monthlyPayment: pay, totalInterest }
}

export default function App() {
  const [country, setCountry] = useState('USA')
  const [region, setRegion] = useState('California')
  const [calcType, setCalcType] = useState<'Auto' | 'Mortgage'>('Auto')

  const [vehiclePrice, setVehiclePrice] = useState(30000)
  const [downPayment, setDownPayment] = useState(3000)
  const [apr, setApr] = useState(6.5)
  const [termMonths, setTermMonths] = useState(60)

  const [homePrice, setHomePrice] = useState(400000)
  const [downPct, setDownPct] = useState(20)
  const [mortgageRate, setMortgageRate] = useState(6.5)
  const [mortgageYears, setMortgageYears] = useState(30)

  const currency = currencies[country] || 'USD'
  const regions = countryRegions[country]

  useEffect(() => {
    setRegion(regions[0])
  }, [country])

  const autoCalc = useMemo(() => {
    const financed = Math.max(0, vehiclePrice - downPayment)
    const { monthlyPayment } = amortize(financed, apr, termMonths)
    return { financed, monthlyPayment }
  }, [vehiclePrice, downPayment, apr, termMonths])

  const mortgageCalc = useMemo(() => {
    const down = (downPct / 100) * homePrice
    const principal = Math.max(0, homePrice - down)
    const { monthlyPayment } = amortize(principal, mortgageRate, mortgageYears * 12)
    return { principal, monthlyPayment }
  }, [homePrice, downPct, mortgageRate, mortgageYears])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4">
      <header className="max-w-5xl mx-auto mb-4">
        <h1 className="text-2xl font-semibold">easycalcnow</h1>
        <p className="text-sm text-gray-600">
          Mortgage and auto finance calculators for USA, Canada, Europe, and Middle East
        </p>
      </header>

      <main className="max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-4">
          <Selector label="Country" value={country} onChange={setCountry} options={Object.keys(countryRegions)} />
          <Selector label="State/Province" value={region} onChange={setRegion} options={regions} />
          <Selector label="Calculator" value={calcType} onChange={v => setCalcType(v as 'Auto' | 'Mortgage')} options={[ 'Auto', 'Mortgage' ]} />
        </div>

        {calcType === 'Auto' ? (
          <Card title="Auto Finance">
            <NumberInput label={`Vehicle Price (${currency})`} value={vehiclePrice} setValue={setVehiclePrice} />
            <NumberInput label={`Down Payment (${currency})`} value={downPayment} setValue={setDownPayment} />
            <NumberInput label="APR %" value={apr} setValue={setApr} />
            <NumberInput label="Term (months)" value={termMonths} setValue={setTermMonths} />
            <p className="mt-2">Monthly Payment: <b>{formatCurrency(autoCalc.monthlyPayment, currency)}</b></p>
          </Card>
        ) : (
          <Card title="Mortgage">
            <NumberInput label={`Home Price (${currency})`} value={homePrice} setValue={setHomePrice} />
            <NumberInput label="Down Payment %" value={downPct} setValue={setDownPct} />
            <NumberInput label="Rate %" value={mortgageRate} setValue={setMortgageRate} />
            <NumberInput label="Term (years)" value={mortgageYears} setValue={setMortgageYears} />
            <p className="mt-2">Monthly Payment: <b>{formatCurrency(mortgageCalc.monthlyPayment, currency)}</b></p>
          </Card>
        )}
      </main>

      <footer className="max-w-5xl mx-auto mt-6 text-xs text-gray-500">
        © {new Date().getFullYear()} easycalcnow. Estimates only.
      </footer>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

function Selector({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string)=>void; options: string[] }) {
  return (
    <label className="flex flex-col text-sm mr-2">
      <span className="mb-1 text-gray-600">{label}</span>
      <select className="rounded border px-2 py-1" value={value} onChange={e=>onChange(e.target.value)}>
        {options.map(o=> <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}

function NumberInput({ label, value, setValue }: { label: string; value: number; setValue: (n: number)=>void }) {
  return (
    <label className="flex flex-col text-sm mb-2">
      <span className="mb-1 text-gray-600">{label}</span>
      <input type="number" className="rounded border px-2 py-1" value={Number(value)} onChange={e=>setValue(parseFloat(e.target.value || '0'))} />
    </label>
  )
}
