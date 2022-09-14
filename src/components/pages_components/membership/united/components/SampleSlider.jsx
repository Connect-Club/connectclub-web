import Slider from 'react-slick'

const SampleSlider = ({ object }) => {
  const settings = {
    arrows: true,
    dots: false,
    infinite: true,
    speed: 300,
    adaptiveHeight: true,
    centerPadding: 10,
    slidesToShow: 3,
    swipeToSlide: true,
    slidesToScroll: 1,
    prevArrow: <SamplePrevArrow />,
    nextArrow: <SampleNextArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          infinite: true,
        },
      },
    ],
  }
  return (
    <Slider {...settings}>
      {object.map((item, index) => (
        <div key={index} className='slider__item'>
          <a href={item.link} target={'_blank'} title={item.name} rel='noreferrer'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className='slider__img' src={item.imgSrc} alt='member' />
          </a>
          <h3 className='slider__name'>
            <a href={item.link} target={'_blank'} title={item.name} rel='noreferrer'>
              {item.name}
            </a>
          </h3>
          <p className='slider__role'>{item.role}</p>
        </div>
      ))}
    </Slider>
  )
}

function SamplePrevArrow(props) {
  const { onClick } = props
  return (
    <div style={{ cursor: 'pointer' }} className='arrow arrow-prev' onClick={onClick}>
      {' '}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src='/united-token-data/img/prev.svg' alt='' />{' '}
    </div>
  )
}

function SampleNextArrow(props) {
  const { onClick } = props
  return (
    <div style={{ cursor: 'pointer' }} className='arrow arrow-next' onClick={onClick}>
      {' '}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src='/united-token-data/img/next.svg' alt='' />{' '}
    </div>
  )
}

export default SampleSlider
