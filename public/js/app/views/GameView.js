/**
 * Created by Matze on 27.09.2015.
 */
Jeopardy.GameView = (function(){
  var that = {},
      SessionModel = undefined,
      $body = undefined,
      questions = undefined,
      $myModal = undefined,
      $myModalLabel = undefined,
      $myModalQuestion = undefined,
      $myModalAnswerInput = undefined,
      currentQuestion = undefined,
      currentTarget = undefined,
      $singlePlayer = undefined,
      isMultiplayer = false,
      $btnWrongAnswer = undefined,
      $btnRightAnswer = undefined,
      $btnAnswerSubmit = undefined,
      $btnCloseQuestion = undefined,
      $myModalAnswer = undefined,
      playerOne = 0,
      playerTwo = 0,
      playerThree = 0,
      answeredQuestions = 0,
      $points = undefined,
      $error = undefined,
      $categories = undefined,
      $multiPlayer = undefined,
      $personRadioGroup = undefined,
      $playerOne = undefined,
      $playerTwo = undefined,
      $playerThree = undefined,
      $modalContainer = undefined,
      $myModalQuestionContainer = undefined,
      $myModalAnswerContainer = undefined,
      $myModalGameOverMessage = undefined,
      init = function(Session){
        $modalContainer = $('#modalContainer');
        _initQuestionModal();
        $playerOne = $('#pointsPlayerOne');
        $playerTwo = $('#pointsPlayerTwo');
        $playerThree = $('#pointsPlayerThree');
        $multiPlayer = $('#buttonMultiPlayer');
        $singlePlayer = $('#buttonSinglePlayer');
        $points = $('#points');
        $body = $('body');
        SessionModel = Session;
        SessionModel.init();
        SessionModel.startNewGame();
        $categories = $('#categories');

        $(window).resize(_arrangeHeadlines);

        _resetGameBoard();

        $singlePlayer.click({isMultiplayer : false}, _onNewGame);
        $multiPlayer.click({isMultiplayer : true}, _onNewGame);

        $body.on('game_initialized', _onGameInitialized);

        $('input[type="image"]').click(_onFieldClicked);
      },
      _onModalLoaded = function(){
        $myModalGameOverMessage = $('#gameOverMessage');
        $error = $('#error');
        $myModal = $('#myModal');
        $myModalLabel = $('#myModalLabel');
        $myModalQuestion = $('#question');
        $myModalQuestionContainer = $("#questionContainer");
        $myModalAnswerContainer = $("#answerContainer");
        $myModalAnswerInput = $('#answerInput');
        $myModalAnswer = $('#answer');
        $personRadioGroup = $('#personRadioGroup');
        $btnCloseQuestion = $('button[name="close_question"]');
        $btnAnswerSubmit = $('button[name="answer_submit"]');
        $btnWrongAnswer = $('button[name="wrong_answer"]');
        $btnRightAnswer = $('button[name="right_answer"]');

        $btnAnswerSubmit.click(_onAnswerSubmit);

        $btnRightAnswer.click(_onAnswerRight);
        $btnWrongAnswer.click(_onAnswerWrong);

        $('button[name="restart_game"]').click({isMultiplayer: isMultiplayer}, function(ev){
          setTimeout(function(){_onNewGame(ev);}, 500);
        });
      },
      _initQuestionModal = function(){
          if(isMultiplayer){
            $modalContainer.load('../templates/multiplayerModal.html', _onModalLoaded);
          }else{
            $modalContainer.load('../templates/singleplayerModal.html', _onModalLoaded);
          }
      },
      _onNewGame = function(ev){
        if(ev.data.isMultiplayer){
          isMultiplayer = true;
        }else{
          isMultiplayer = false;
        }

        _initQuestionModal();

        questions = undefined;

        playerOne = 0;
        answeredQuestions = 0;

        _resetGameBoard();

        SessionModel.init();
        SessionModel.startNewGame();
      },
      _onGameInitialized = function(ev, data){;
        questions = data;

        if(isMultiplayer){
          $multiPlayer.attr('src', '../../../images/multiPlayerSelected.jpg');
          $singlePlayer.attr('src', '../../../images/button_singleplayer.png');
        }else{
          $singlePlayer.attr('src', '../../../images/singlePlayerSelected.jpg');
          $multiPlayer.attr('src', '../../../images/button_multiplayer.png');
        }

        _showCategories();
        _arrangeHeadlines();
        _setValues();
        _enableGame();
      },
      _resetGameBoard = function(){
        $('input[type="image"]').addClass('overlay');
        $('input[type="image"]').prop('disabled', true);
      },
      _enableGame = function(){
        $('input[type="image"]').removeClass('overlay');
        $('input[type="image"]').prop('disabled', false);
      },
      _showCategories = function(){
        var counter = 1;
        for(var key in questions){
          if(questions.hasOwnProperty(key)){
            var $category = $('#category_' + counter + ' h4');
            $category.html(""+key);

            counter++;
          }
        }
      },
      _setValues = function(){
        var counterCategories = 1;
        for(var key in questions){
          var counterRows = 1;
          for(var val in questions[key]){
            var field = $('#row_' + counterRows).find('input[data-category=' + counterCategories + ']');
            field.data('value', val);
            field.attr('src', _getImageSrc(val));
            counterRows++;
            if(counterRows >= 6){
              break;
            }
          }
          counterCategories++;
        }
      },
      _getImageSrc = function(val){
        switch (val){
          case '$100':
            return '../../../images/button_100.jpg';
          case '$200':
            return '../../../images/button_200.png';
          case '$300':
            return '../../../images/button_300.jpg';
          case '$400':
            return '../../../images/button_400.png';
          case '$500':
            return '../../../images/button_500.jpg';
          case '$600':
            return '../../../images/button_600.png';
          case '$700':
            return '../../../images/button_700.jpg';
          case '$800':
            return '../../../images/button_800.png';
          case '$900':
            return '../../../images/button_900.jpg';
          case '$1000':
            return '../../../images/button_1000.png';
        }
      },
      _onFieldClicked = function(ev){
        var field = $(ev.currentTarget),
            category = $('#category_' + field.data('category') + ' h4').html(),
            value = field.data('value'),
            question = questions[category.replace(/&amp;/g, '&')][value];

        currentTarget = field;
        currentQuestion = question;

        _showQuestion(question);
        _showAnswer(question.answer);
      },
      _showAnswer = function(answer){
        $myModalAnswer.html(answer);
      },
      _showQuestion = function(question){
        var headline = 'Category: ' + question.category + '   Value: ' + question.value;
        $myModalLabel.html(headline);
        $myModalQuestion.html(question.question[0]);
        $myModal.modal('show');
      },
      _onAnswerSubmit = function(){
        var answer = $myModalAnswerInput.val();
        if(answer.trim()) {
          $error.addClass('hide');
          if (answer.toLowerCase() === currentQuestion.answer.toLowerCase()) {
            _increasePoints(currentQuestion.value, playerOne);
          }else{
            _decreasePoints(currentQuestion.value, playerOne);
          }
          $myModalAnswerInput.val("");
          _onAnswered();
        }else{
          $error.removeClass('hide');
        }
      },
      _getCurrentPlayer = function(){
        return $personRadioGroup.find('.active').find('input').val();
      },
      _updatePlayerScores = function(){
        $playerOne.html('Player 1: $' + playerOne);
        $playerTwo.html('Player 2: $' + playerTwo);
        $playerThree.html('Player 3: $' + playerThree);
      },
      _onAnswerRight = function(){
        var currentPlayer = _getCurrentPlayer();
        _increasePoints(currentQuestion.value, currentPlayer);
        _onAnswered();
      },
      _onAnswerWrong = function(){
        var currentPlayer = _getCurrentPlayer();
        _decreasePoints(currentQuestion.value, currentPlayer);
        _onAnswered();
      },
      _onAnswered = function(){
        _updatePlayerScores();
        currentTarget.prop('disabled', true);
        currentTarget.addClass('overlay');
        answeredQuestions++;
        if(answeredQuestions >= 2){
          answeredQuestions = 0;
          $('button[name="answer_submit"]').addClass('hide');
          $('button[name="restart_game"]').removeClass('hide');

          if(isMultiplayer){
            $btnRightAnswer.addClass('hide');
            $btnWrongAnswer.addClass('hide');
          }else {
            $myModalAnswerInput.addClass('hide');
          }

          $myModalQuestionContainer.addClass('hide');
          $myModalAnswerContainer.addClass('hide');

          $myModalLabel.html('GAME OVER');
         _setGameOverMessage();
        }else{
          $myModal.modal('hide');
        }
      },
      _setGameOverMessage = function(){
        if(isMultiplayer){
          var list = _getPlayerList();
          $myModalGameOverMessage.html('1. Player' + list[2].player + ': $' + list[2].score + '<br>' + '2. Player' + list[1].player + ': $' + list[1].score + '<br>' + '3. Player' + list[0].player + ': $' + list[0].score);
        }else{
          $myModalGameOverMessage.html('You won: $' + playerOne);
        }
        $myModalGameOverMessage.removeClass('hide');
      },
      _getPlayerList = function(){
        var list = [];
        list.push({player: 1, "score": playerOne});
        list.push({player: 2, "score": playerTwo});
        list.push({player: 3, "score": playerThree});

        return _(list).sortBy(function(obj){
          return obj.score;
        });
      },
      _decreasePoints = function(value, player){
        if(player === "1"){
          playerOne -= SessionModel.stringToNumber(value);

          if(playerOne < 0){
            playerOne = 0;
          }
        }
        if(player === "2"){
          playerTwo -= SessionModel.stringToNumber(value);

          if(playerTwo < 0){
            playerTwo = 0;
          }
        }
        if(player === "3"){
          playerThree -= SessionModel.stringToNumber(value);

          if(playerThree < 0){
            playerThree = 0;
          }
        }
      },
      _increasePoints = function(value, player){
        if(player === "1"){
          playerOne += SessionModel.stringToNumber(value);
        }
        if(player === "2"){
          playerTwo += SessionModel.stringToNumber(value);
        }
        if(player === "3"){
          playerThree += SessionModel.stringToNumber(value);
        }
      },
      _arrangeHeadlines = function(){
        var width = $('#row_1 input').first().width(),
            height = $('#row_1 input').first().height();

        $categories.width((width)*5);

        for(var i = 1; i < 6; i++){
          $('#category_' + i).width(width);
          $('#category_' + i).height(height);
        }
      };

  that.init = init;

  return that;
})();