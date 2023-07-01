import { create } from 'zustand'

type EditedTask = {
  id: number
  title: string
}

type State = {
  editedTask: EditedTask
  updateEditedTask: (task: EditedTask) => void // taskは引数
  resetEditedTask: () => void
}

/* editedTaskの状態を管理 */
const useStore = create<State>((set) => ({
  editedTask: { id: 0, title: '' }, // 初期値
  updateEditedTask: (task) =>
    set({
      editedTask: task,
    }),
  resetEditedTask: () => set({ editedTask: { id: 0, title: '' } }),
}))

export default useStore
