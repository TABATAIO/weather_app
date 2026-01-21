// // document.addEventListener('DOMContentLoaded', () => {
// // const hero = document.querySelector('.weather-hero');
// // const iconEl = document.querySelector('.weather-illustration');

// // if (!hero || !iconEl) return;

// // const weatherIcon = iconEl.textContent.trim();

// // hero.classList.remove(
// //     'weather-sunny',
// //     'weather-cloudy',
// //     'weather-rainy',
// //     'weather-snow'
// // );

// // if (weatherIcon.includes('☀️')) {
// //     hero.classList.add('weather-sunny');
// // } else if (
// //     weatherIcon.includes('🌤️') ||
// //     weatherIcon.includes('☁️')
// // ) {
// //     hero.classList.add('weather-cloudy');
// // } else if (weatherIcon.includes('🌧️')) {
// //     hero.classList.add('weather-rainy');
// // } else if (weatherIcon.includes('❄️')) {
// //     hero.classList.add('weather-snow');
// // }
// // });

// document.addEventListener('DOMContentLoaded', () => {
// const hero = document.querySelector('.weather-hero');
// const buttons = document.querySelectorAll('.weather-btn');
// const bgImg = document.getElementById('character-bg');
// const icon = document.getElementById('weather-icon');
// const tempMax = document.getElementById('temp-max');
// const tempMin = document.getElementById('temp-min');

// const weatherData = {
//     sunny: {
//     bg: 'img/bg_sunny.png',
//     icon: '☀️',
//     max: '30°',
//     min: '22°'
//     },
//     cloudy: {
//     bg: 'img/bg_cloudy.png',
//     icon: '☁️',
//     max: '28°',
//     min: '21°'
//     },
//     rainy: {
//     bg: 'img/bg_rainy.png',
//     icon: '🌧️',
//     max: '26°',
//     min: '20°'
//     }
// };

// buttons.forEach(btn => {
//     btn.addEventListener('click', () => {
//     const weather = btn.dataset.weather;

//     // クラス切替
//     hero.classList.remove('weather-sunny', 'weather-cloudy', 'weather-rainy');
//     hero.classList.add(`weather-${weather}`);

//     // 表示内容切替
//     bgImg.src = weatherData[weather].bg;
//     icon.textContent = weatherData[weather].icon;
//     tempMax.textContent = weatherData[weather].max;
//     tempMin.textContent = weatherData[weather].min;
//     });
// });
// });

// bgImg.style.backgroundImage = `url(${weatherData[weather].bg})`;