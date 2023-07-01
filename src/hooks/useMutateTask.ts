import axios from 'axios'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { Task } from '../types'
import useStore from '../store'
import { useError } from '../hooks/useError'

export const useMutateTask = () => {
  const queryClient = useQueryClient()
  const { switchErrorHandling } = useError()
  const resetEditedTask = useStore((state) => state.resetEditedTask)

  const createTaskMutation = useMutation(
    (task: { title: string }) =>
      // Omit<Task, 'id' | 'created_at' | 'updated_at'> と title: string は同じ
      axios.post<Task>(`${process.env.REACT_APP_API_URL}/tasks`, task), // 引数で受け取ったtaskをエンドポイントに投げる
    {
      onSuccess: (res) => {
        const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])
        if (previousTasks) {
          // 既存のキャッシュが存在する場合
          queryClient.setQueryData(['tasks'], [...previousTasks, res.data]) // キャッシュの末尾に新しいタスクを追加する
        }
        resetEditedTask() // タスクの追加が完了したら、編集中のタスクをリセットする
      },
      // エラーが発生した場合の処理
      onError: (err: any) => {
        if (err.response.data.message) {
          switchErrorHandling(err.response.data.message)
        } else {
          switchErrorHandling(err.response.data)
        }
      },
    }
  )
  const updateTaskMutation = useMutation(
    (
      task: { title: string; id: number } // updateではtitleとidを参照する
    ) =>
      axios.put<Task>(`${process.env.REACT_APP_API_URL}/tasks/${task.id}`, {
        title: task.title,
      }),
    {
      onSuccess: (res, variables) => {
        const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])
        if (previousTasks) {
          queryClient.setQueryData<Task[]>(
            ['tasks'],
            previousTasks.map(
              (task) => (task.id === variables.id ? res.data : task) // idが一致するタスクのみ更新
            )
          )
        }
        resetEditedTask()
      },
      onError: (err: any) => {
        if (err.response.data.message) {
          switchErrorHandling(err.response.data.message)
        } else {
          switchErrorHandling(err.response.data)
        }
      },
    }
  )
  const deleteTaskMutation = useMutation(
    (id: number) =>
      // deleteにはidのみ必要
      axios.delete(`${process.env.REACT_APP_API_URL}/tasks/${id}`),
    {
      onSuccess: (_, variables) => {
        const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])
        if (previousTasks) {
          queryClient.setQueryData<Task[]>(
            ['tasks'],
            previousTasks.filter((task) => task.id !== variables)
            // 削除したタスクを除いた新しいタスクの配列を作成
          )
        }
        resetEditedTask()
      },
      onError: (err: any) => {
        if (err.response.data.message) {
          switchErrorHandling(err.response.data.message)
        } else {
          switchErrorHandling(err.response.data)
        }
      },
    }
  )
  return {
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
  }
}
