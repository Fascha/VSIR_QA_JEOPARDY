/**
 * Created by Matze on 01.10.2015.
 */
Jeopardy.TagCloud = (function(){
  var that = {},
      sessionModel,
      $body = undefined,
      cloudType = undefined,
      init = function(Session, type){
        cloudType = type;
        sessionModel = Session;
        sessionModel.init();

        $body = $('body');
        $body.on('fetched_tags', _onTagsFetched);

        _fetchCloudTags();
      },
      _fetchCloudTags = function(){
        switch (cloudType){
          case 'question':
            sessionModel.getQuestionTagCloudList();
            break;
          case 'answer':
            sessionModel.getAnswerTagCloudList();
              break;
          case 'category':
            sessionModel.getAllCategories();
              break;
          default :
            cloudType = 'question';
            sessionModel.getQuestionTagCloudList();
              break;
        }
      },
      _onTagsFetched = function(ev, data){
        _initTagUIList(data.list);
        _renderTagCloud(data.list, 'tagCanvas');
      },
      _initTagUIList = function(list){
       var $ul = $('#tags').find('ul');

       $ul.empty();

        for(var i = 0; i < list.length; i++){
          var $a = $('<a>', {href: sessionModel.APIPATH + 'q='+ cloudType + ':' + '"' + list[i][0].replace(/&/g, '%26') + '"' + sessionModel.INDENT + sessionModel.WT_JSON, html: list[i][0], target: "_blank"}),
              $li = $('<li>');

          $li.append($a);
          $ul.append($li);
        }
      },
      _renderTagCloud = function(list, selector){
        try {
          TagCanvas.Start(selector,'tags', {textColour: "#000000", radiusX: 3, radiusY: 3, radiusZ: 1});
        } catch(e) {
          // something went wrong, hide the canvas container
          document.getElementById(selector).style.display = 'none';
        }
        //WordCloud(document.getElementById(selector), { list: list } );
      };
  that.init = init;

  return that;
})()