var MyWikipediaAPI = function(url){
  this.datas = [];
  this.url = url;

　// Ajax
  this.getData = $.ajax({
      url:this.url,
      type:'GET',
      cache:true,
      context:this,
      dataType:'text'
    });
  
  // 整形
  this.shaping = function(t){
    
    // 問21＆22
    t.categoles = t.text.match(/\[\[カテゴリ:[^\]]*?\]\]/g);
    if(t.categoles){
      for (var j = 0; j < t.categoles.length; j++) {
        t.categoles[j] = t.categoles[j].replace(/\[\[カテゴリ:([^\]]*?)\]\]/,'$1');
      }
    }

    // 問23
    t.sections = t.text.match(/={2,} [^=]*? ={2,}/g);
    if(t.sections){
      for (var j = 0; j < t.sections.length; j++) {
        _level = t.sections[j].replace(/(={2,}).+/,'$1').length - 1
        t.sections[j] = {
          level:_level,
          name:t.sections[j].replace(/^={2,} (.*?) ={2,}$/,'$1')
        }
      }
    }

    // 問24
    t.files = t.text.match(/\[\[ファイル:[^\]]*?\]\]/g);
    if(t.files){
      for (var j = 0; j < t.files.length; j++) {
         _datas = t.files[j].replace(/\[\[ファイル:([^\]]*?)\]\]/,'$1').split("|");
         t.files[j] = {
           name:_datas[0],
           size:_datas[1],
           alt:_datas[2]
         }
      }
    }

    // 問25-29
    if(t.text.match(/{{基礎情報[\s\S]*?}}\n/g)){
      
      // 基礎情報スタートライン
      var _lines = t.text.replace(/[\s\S]*{{基礎情報 国([\s\S]*)/g,'$1').replace(/\|\n/g,'\n|').split("\n|");
      var _setLines = []
      for (var j = 0; j < _lines.length; j++) {
        var targetLine = _lines[j];

        //問25
        targetLine = targetLine.trim().replace('|','');
        
        // 基礎情報エンドライン
        if(targetLine.indexOf("}}\n") == 0){
          j = _lines.length + 1;
        }else if(targetLine.indexOf("}}\n") > 0){
          targetLine = targetLine.split("}}\n")[0];
          j = _lines.length + 1;
        }
        if(j<_lines.length && targetLine != ""){

          // 問26
          targetLine = targetLine.replace(/'{2,}/g,'');
          
          // 問27
          var _reg = /\[\[(.*?)\]\]/g;
          var _rep = "__reg__link__ptn__";
          var _links = targetLine.match(_reg);
          if(_links){
            targetLine = targetLine.replace(_reg,_rep);
            for (var k = 0; k < _links.length; k++) {
              var _cnp = _links[k].replace(_reg,'$1').split("|");
              targetLine = targetLine.replace(_rep,_cnp[_cnp.length - 1]);
            }
          }

          // 問28
          targetLine = targetLine
            .replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'')
            .replace(/{{[^\|]*?\|/g,'')
            .replace(/}}/g,'')
            .replace(/\[[^\[]*?\]/g,'');

          // キー配列に変換
          var _name = targetLine.replace(/([^=]*?)=[\s\S]*/,'$1').trim();
          var _val = targetLine.replace(/.*?=([\s\S]*)/,'$1').trim().replace(/\n/,'');
          _setLines[_name] = _val;
        }
      }
      t.baseData = _setLines;
    }
    this.datas[t.title] = t;
  }
  
  // 国旗画像データの取得
  this.getFlagImg = function(name){
    if(this.datas[name].baseData["国旗画像"]){
      return $.ajax({
          url: 'https://en.wikipedia.org/w/api.php?action=query&titles=File:' + encodeURIComponent(this.datas[name].baseData["国旗画像"]) + '&prop=imageinfo&iiprop=url&format=json',
          type:'get',
          context:this,
          dataType:'jsonp'
      });
    }
  }
}