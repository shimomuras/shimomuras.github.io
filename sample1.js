$(function() {
  $('.click_button').click(function() {
//   $('.acc_button').toggleClass('open',200);  
    $(this).next().slideToggle(400);
    $(this).prev().toggleClass('open',200); 
  });
});


$(function(){
    $.ajaxSetup({cache:false});
    $(".achieve_2022").load("achieve/2022.html");
    $(".achieve_2021").load("achieve/2021.html");
    $(".achieve_2020").load("achieve/2020.html");
    $(".achieve_2019").load("achieve/2019.html");
    $(".achieve_2018").load("achieve/2018.html");
    $(".achieve_2017").load("achieve/2017.html");
    $(".achieve_2016").load("achieve/2016.html");
});


$(function() {
    $('.header_button').click(function(){
 $('.header_button').toggleClass('close');
 $('.nav-wrapper').fadeToggle(300);
  });
});

$(function () {
$('.side_slide').each(function () { //① slideshow クラス要素ごとに処理を実行
var slides = $(this).find('img'), // すべてのスライド
slideCount = slides.length, // スライドの点数
currentIndex = 0; // 現在のスライドを示す
slides.eq(currentIndex).fadeIn(3000); // 1 番目のスライドをフェードイン
setInterval(showNextSlide, 3000); // 5000 ミリ秒ごとに関数を実行
function showNextSlide () { // 次のスライドを表示する関数
    var nextIndex= (currentIndex +1) % slideCount; // 次に表示するスライド
   slides.eq(currentIndex).fadeOut(3000); // 現在のスライドをフェードアウト
   
    slides.eq(nextIndex).fadeIn(3000); // 次のスライドをフェードイン
    currentIndex = nextIndex; // 現在のスライドのインデックスを更新
    
    
}
}); 
});