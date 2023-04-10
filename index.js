const { create } = require('domain');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const synopsisLength = 128;

const app = express();
app.use(cors({
  credentials: true, // This is important.
  origin: (origin, callback) => {
      return callback(null, true)
  }
}));
app.use(bodyParser.json({ type: '*/*' }))
const port = 3000;

// Database

const todoListStructure = {
  "title": String,
  "synopsis": String,
  "content": String,
  "isDelete": { type: Boolean, default: false },
  "createDate": { type: String, default: Date.now() },
  "updateDate": { type: String, default: Date.now() },
  "createBy": String,
  "updateBy": String
}
let TodoListModel = null;

(async () => {
  await mongoose.connect(process.env.MONGO_URL);
  const Schema = new mongoose.Schema(todoListStructure);
  // Duplicate the ID field.
  Schema.virtual('id').get(function(){
    return this._id.toHexString();
  });

  // Ensure virtual fields are serialised.
  Schema.set('toJSON', {
    virtuals: true
  });

  TodoListModel = mongoose.model('TodoList',  Schema);

})();

const readAllTodoList = async () => {
  return await TodoListModel.find({
    isDelete: false
  });
}

const readTodoList = async (id) => {
  const re = await TodoListModel.findOne({
    _id: new mongoose.Types.ObjectId(id),
    isDelete: false
  }) ?? {};
  if (re.isDelete === true) {
    return {};
  }
  return re;
}

const getSynopsis = (content) => {
  const synopsis = content.slice(0, synopsisLength)
  return synopsis + (synopsis.length === synopsisLength ? "..." : "");
}
const createTodoList = async ({
  title,
  content
} = {}) => {
  const synopsis = content === undefined ? undefined : getSynopsis(content)
  const NewTodoList = new TodoListModel({ 
    title,
    synopsis,
    content
  });
  const re = await NewTodoList.save();
  return re;
}

const updateTodoList = async (id, {
  title,
  content
} = {}) => {
  const synopsis = content === undefined ? undefined : getSynopsis(content)
  const re = await TodoListModel.findByIdAndUpdate(id, { 
    title,
    synopsis,
    content,
    updateDate: Date.now()
  });
  return re;
}

const deleteTodoList = async (id) => {
  const re = await TodoListModel.findByIdAndUpdate(id, { 
    isDelete: true
  });
  return re;
}

// Controller

app.get('/todolist', (req, res) => {
  (async () => {
    const re = await readAllTodoList();
    res.send(re);
  })();
});

app.get('/todolist/:id', (req, res) => {
  (async () => {
    const re = await readTodoList(req.params.id);
    res.send(re);
  })();
});

app.post('/todolist', (req, res) => {
  (async () => {
    const re = await createTodoList(req.body);
    res.send(re);
  })();
});

app.put('/todolist/:id', (req, res) => {
  (async () => {
    const re = await updateTodoList(req.params.id, req.body);
    res.send(re);
  })();
});

app.delete('/todolist/:id', (req, res) => {
  (async () => {
    const re = await deleteTodoList(req.params.id);
    res.send(re);
  })();
});

app.get('/', (req, res) => {
  res.send("hi there")
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});