import * as React from "react"
import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 3
const DEFAULT_REMOVE_DELAY = 3000

export type ToastInput = Omit<ToastProps, "id" | "open"> & {
  title?: React.ReactNode
  description?: React.ReactNode
  duration?: number
}

export type Toast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  duration?: number
}

type Action =
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "UPDATE_TOAST"; toast: Omit<Toast, "open"> }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string }

interface State {
  toasts: Toast[]
}

export const toastReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      }
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return { ...state, toasts: [] }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

let memoryState: State = { toasts: [] }
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
const listeners: Array<(state: State) => void> = []

function dispatch(action: Action) {
  memoryState = toastReducer(memoryState, action)

  if (action.type === "DISMISS_TOAST") {
    if (action.toastId) {
      const toast = memoryState.toasts.find((t) => t.id === action.toastId)
      // If toast is already closed, remove it immediately, otherwise schedule removal
      if (toast && !toast.open) {
        dispatch({ type: "REMOVE_TOAST", toastId: action.toastId })
      } else {
        const timeout = setTimeout(() => {
          toastTimeouts.delete(action.toastId!)
          dispatch({ type: "REMOVE_TOAST", toastId: action.toastId })
        }, DEFAULT_REMOVE_DELAY)
        toastTimeouts.set(action.toastId!, timeout)
      }
    } else {
      // Dismiss all toasts
      memoryState.toasts.forEach((toast) => {
        const timeout = setTimeout(() => {
          toastTimeouts.delete(toast.id)
          dispatch({ type: "REMOVE_TOAST", toastId: toast.id })
        }, DEFAULT_REMOVE_DELAY)
        toastTimeouts.set(toast.id, timeout)
      })
    }
  }

  listeners.forEach((listener) => listener(memoryState))
}

export function toast({ ...props }: ToastInput) {
  const id = crypto.randomUUID()
  const duration = props.duration ?? DEFAULT_REMOVE_DELAY

  const update = (p: Omit<Toast, "id" | "open">) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...p, id },
    })

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      duration,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id,
    dismiss,
    update,
  }
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}