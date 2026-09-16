import Header from './Header.jsx'

export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  )
}
