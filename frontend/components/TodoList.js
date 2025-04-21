import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api'; // для веб
const MOBILE_API_URL = 'http://10.0.2.2:8080/api'; // для мобильных устройств

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const baseURL = Platform.OS === 'web' ? API_URL : MOBILE_API_URL;

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
    setLoading(false);
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      const response = await axios.post(`${baseURL}/todos`, {
        text: newTodo,
        completed: false,
      });
      setTodos([...todos, response.data]);
      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      await axios.put(`${baseURL}/todos/${id}`, { completed: !completed });
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, completed: !completed } : todo
      ));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${baseURL}/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const updateTodo = async (id) => {
    if (!editText.trim()) return;
    try {
      const response = await axios.put(`${baseURL}/todos/${id}`, {
        text: editText,
      });
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, text: editText } : todo
      ));
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleTodo(item.id, item.completed)}
      >
        {item.completed && <Ionicons name="checkmark" size={24} color="#2196F3" />}
      </TouchableOpacity>

      {editingId === item.id ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editText}
            onChangeText={setEditText}
            autoFocus
          />
          <TouchableOpacity onPress={() => updateTodo(item.id)}>
            <Ionicons name="save" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={[
            styles.todoText,
            item.completed && styles.completedTodo
          ]}>
            {item.text}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => {
                setEditingId(item.id);
                setEditText(item.text);
              }}
            >
              <Ionicons name="pencil" size={24} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTodo(item.id)}>
              <Ionicons name="trash" size={24} color="#FF0000" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newTodo}
          onChangeText={setNewTodo}
          placeholder="Добавить новую задачу"
          placeholderTextColor="#666"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonText}>Добавить</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" />
      ) : (
        <FlatList
          data={todos}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          style={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 12,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todoText: {
    flex: 1,
    fontSize: 16,
  },
  completedTodo: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
}); 