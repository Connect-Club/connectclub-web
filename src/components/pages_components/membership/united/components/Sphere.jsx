import dynamic from 'next/dynamic'

export default function Sphere() {
  const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
  })
  return (
    <div>
      <Spline scene={`https://prod.spline.design/cjbUufY93RTELhWx/scene.spline`} />
    </div>
  )
}
