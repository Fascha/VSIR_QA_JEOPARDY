/**
 * Created by Matze on 27.09.2015.
 */
var Jeopardy = {
  initMainPageView: function() {
    this.MainPageView.init(this.Session);
  },
  initGameView: function(){
    this.GameView.init(this.Session);
  }
};