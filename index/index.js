class Problem {
  //请求的基础地址，设置为属性
  baseUsrl = 'http://localhost:3000/problem';
  // 构造方法,new类的时候,直接调用
  constructor() {
    // 调用获取数据的方法
    this.getData()
    this.bindEve();

  }
  // 给按钮绑定事件
  bindEve() {
    // 节点的点击事件的回调函数中的this指向,节点对象.
    // 使用bind 让它指向当前实例化对象
    Problem.$$('#save-data').addEventListener('click', this.saveData.bind(this));
    // 给tbody绑定点击事件，将所有的删除按钮的事件,委托给tbody
    Problem.$$('.content tbody').addEventListener('click', this.setData.bind(this));

    // 给修改的保存,绑定点击事件
    Problem.$$('#modify-data').addEventListener('click', this.modifyData.bind(this));

    // 给ul绑定点击事件
    Problem.$$('.pagination').addEventListener('click', this.setPage.bind(this));
    // 给删除模态框,的删除按钮,绑定事件
    Problem.$$('#delSure').addEventListener('click', this.delSure.bind(this));
  }
  // tbody点击事件的回调函数
  setData(event) {
    // console.log(this);
    // console.log(event.target);
    // console.log(event.target.id);
    // 通过id,判断当前点击的是什么按钮
    // id为delData 的就是删除
    if (event.target.id == 'delData') this.delData(event.target);
    // id为modifyData,表示点击的为修改按钮
    if (event.target.id == 'modifyData') this.updateData(event.target);
  }
  //修改的方法
  updateData(target) {
    // console.log(target);
    // 展示修改的模态框
    $('#modifyModal').modal('show');
    // 获取tr
    let trObj = target.parentNode.parentNode;

    let child = trObj.children;

    // console.log(chld);
    // 获取id
    let id = child[0].innerHTML;
    let title = child[1].innerHTML;
    let pos = child[2].innerHTML;
    let idea = child[3].innerHTML;

    // console.log(id, title, pos, idea);
    // 将原来的数据,放到模态框中
    let form = document.forms[1];
    // console.log(document.forms[1].elements);
    let ele = form.elements;
    // console.log(ele);

    ele.title.value = title
    ele.pos.value = pos;
    ele.idea.value = idea;
    // 将id,放到input中,它是不可修改的
    ele.id.value = id;
  }
  // 保存修改的数据
  modifyData() {
    // console.log(document.forms[1].elements);
    let ele = document.forms[1].elements;
    // 获取表单中的数据
    let id = ele.id.value;
    let title = ele.title.value.trim();
    let pos = ele.pos.value.trim();
    let idea = ele.idea.value.trim();

    // console.log(id, title);
    // 判断不能为空
    if (!title || !pos || !idea) throw new TypeError('不能为空');

    // 发送ajax请求,将数据更新到db.json
    // 变量名和属性名一致时,可以直接写变量名
    axios.patch(this.baseUsrl + '/' + id, {
      title,
      pos,
      idea
    }).then(data => {
      location.reload();
    })
  }

  // 删除数据
  // delData(target) {
  //   // console.log(event.target);
  //   // event.target.remove();
  //   // 寻找tr按钮
  //   let trObj = target.parentNode.parentNode;
  //   // console.log(trObj);
  //   // console.log(trObj.dataset.id);
  //   // 获取id,发送ajax使用
  //   let id = trObj.dataset.id;
  //   // 发送请求删除数据

  //   axios.delete(this.baseUsrl + '/' + id)
  //     .then(data => {
  //       // console.log(data);
  //       if (data.status == 200) {
  //         // 删除节点
  //         trObj.remove();
  //       }
  //     })
  // }
  /******提示之后删除******/
  delData(target) {
    // 保存点击的删除按钮
    this.target = target
    $('#delModal').modal('show')
  }
  // 确定删除的方法
  delSure() {
    // console.log(1111);
    // console.log(this.target);
    //获取当前正在删除的tr
    let trObj = this.target.parentNode.parentNode;
    // console.log(trObj);
    // 获取data属性上的id
    let id = trObj.dataset.id;
    // console.log(id);
    // 发送ajax请求
    axios.delete(this.baseUsrl + '/' + id).then(data => {
      // console.log(data);
      if (data.status == 200) {
        // 刷新页面
        location.reload();
      }

    })




  }

  // 点击保存按钮回调的方法
  saveData() {
    // console.log(this);
    // 获取页面中表达
    let form = document.forms[0];
    // console.log(form.elements);
    // return;
    // 解构出 title, pos, idea 三个属性
    let { title, pos, idea } = form.elements;
    // console.log(title, pos, idea);
    // console.log(idea.value);
    // 判断是否为空,为空则抛出错误
    if (!title.value.trim() || !pos.value.trim() || !idea.value.trim()) throw new Error('This value not null');
    // 不为空则添加到json中
    axios.post(this.baseUsrl, {
      title: title.value,
      idea: idea.value,
      pos: pos.value
      // then(data=>{})
    }).then(({ status }) => {
      // console.log(data);
      // console.log(status);
      if (status == 201) {
        // 重新刷新页面
        location.reload();
      }
    });

  }
  // 获取数据的方法
  async getData(page = 1) {
    let limit = 5;
    // 1 获取数据
    let res1 = await axios.get(this.baseUsrl + '?' + '_page=' + page + '&_limit=5');
    // console.log(res1);

    let { status, data, headers } = res1;
    //当属性为变量时,才用 [],特殊情况下,属性不是变量也可以直接用
    // console.log(headers['x-total-count']);
    //  计算能显示几页,设置为属性,可以在其他非静态方法中使用
    this.countPage = Math.ceil(headers['x-total-count'] / limit);
    // console.log(countPage);
    // 分页li的显示
    // #none 阻止跳转的行为
    let pageHtml = `<li>
    <a href="#none" aria-label="Previous">
      <span aria-hidden="true">&laquo;</span>
    </a>
  </li>`;
    for (var i = 1; i <= this.countPage; i++) {
      pageHtml += `<li class="${page == i && 'active'}">
        <a href="#none">${i}</a>
       </li>`
    }
    pageHtml += `<li>
    <a href="#none" aria-label="Next">
      <span aria-hidden="true">&raquo;</span>
    </a>
  </li>`

    Problem.$$('.pagination').innerHTML = pageHtml;
    // 2 判断返回的状态
    if (status != 200) throw new Error('请求失败...');
    // 3 将数据遍历追加到页面中
    // console.log(data);
    let tr = '';
    data.forEach(ele => {
      tr += `<tr data-id=${ele.id}>
      <th scope="row">${ele.id}</th>
      <td>${ele.title}</td>
      <td>${ele.pos}</td>
      <td>${ele.idea}</td>
      <td>
        <button type="button" class="btn btn-warning btn-xs" id="modifyData">修改</button>
        <button type="button" class="btn btn-danger btn-xs" id="delData">删除</button>
      </td>
    </tr>`;
    });
    // 4 将内容追加到页面中
    // console.log(tr);
    Problem.$$('tbody').innerHTML = tr;
    // console.log(Problem.$$('tbody'));
    // console.log(Problem.$$('div', true));


  }
  setPage(event) {
    // console.log(event.target.innerHTML - 0);
    let target = event.target;
    if (target.nodeName == 'A') {
      // 获取时纯字符串,-0 之后为NaN
      // console.log(target.innerHTML - 0);
      if (target.innerHTML - 0) { // 点击的是数字,-0,则转化为number类型
        // 点的是数字页码
        this.getData(target.innerHTML);
        return;
      }
      // 点击的是上一页或者下一页
      this.nextPrevious(target);
    }
    if (target.nodeName == 'SPAN') {
      // 获取span的父级
      let aObj = target.parentNode;
      // console.log(aObj);
      // 区分点击的是上一页还是下一页
      this.nextPrevious(aObj);
    }
  }
  nextPrevious(aObj) {
    let curPage = Problem.$$('.active').firstElementChild.innerHTML;
    if (aObj.getAttribute('aria-label') == 'Next') {  // 下一页
      // console.log(Problem.$$('.active').firstElementChild.innerHTML);
      // console.log(this.countPage);
      // 判断当前是否为最后一页
      if (curPage == this.countPage) return;
      ++curPage;
    }
    if (aObj.getAttribute('aria-label') == 'Previous') {  //   // 判断上一页
      // 如果是第一页则不响应
      if (curPage == 1) return;
      --curPage
    }
    this.getData(curPage)
  }
  // 获取节点的方法
  static $$(ele, all = false) {
    // return all ? document.querySelectorAll(ele) : document.querySelector(ele);
    let res = document.querySelectorAll(ele);
    // console.log(res);
    //通过长度判断获取到的是否为单个节点
    // 获取到的是单个元素, 则返回下标为0
    // 否则就返回所有
    return res.length == 1 ? res[0] : res;
  }
}
new Problem;