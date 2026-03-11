import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../lib/firebase'
import toast from 'react-hot-toast'

export function useRecipes(cookbookType) {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const collectionName = cookbookType === 'moms' ? 'recipes_moms' : 'recipes_bakery'

  useEffect(() => {
    if (!cookbookType) {
      setLoading(false)
      return
    }
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setRecipes(data)
      setLoading(false)
    }, (err) => {
      console.error('Error fetching recipes:', err)
      setLoading(false)
    })
    return unsub
  }, [cookbookType, collectionName])

  return { recipes, loading }
}

export function useRecipe(recipeId, cookbookType) {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!recipeId || !cookbookType) {
      setLoading(false)
      return
    }
    const collectionName = cookbookType === 'moms' ? 'recipes_moms' : 'recipes_bakery'
    const unsub = onSnapshot(doc(db, collectionName, recipeId), (snap) => {
      if (snap.exists()) {
        setRecipe({ id: snap.id, ...snap.data() })
      } else {
        setRecipe(null)
      }
      setLoading(false)
    })
    return unsub
  }, [recipeId, cookbookType])

  return { recipe, loading }
}

export function useAllRecentRecipes(count = 5) {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const [momsSnap, bakerySnap] = await Promise.all([
          getDocs(query(collection(db, 'recipes_moms'), orderBy('createdAt', 'desc'), limit(count))),
          getDocs(query(collection(db, 'recipes_bakery'), orderBy('createdAt', 'desc'), limit(count))),
        ])
        const momsData = momsSnap.docs.map((d) => ({ id: d.id, cookbook: 'moms', ...d.data() }))
        const bakeryData = bakerySnap.docs.map((d) => ({ id: d.id, cookbook: 'bakery', ...d.data() }))
        const all = [...momsData, ...bakeryData]
          .sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0
            const bTime = b.createdAt?.toMillis?.() || 0
            return bTime - aTime
          })
          .slice(0, count)
        setRecipes(all)
      } catch (err) {
        console.error('Error fetching recent recipes:', err)
      }
      setLoading(false)
    }
    fetch()
  }, [count])

  return { recipes, loading }
}

export function useCookbookStats() {
  const [stats, setStats] = useState({ moms: { count: 0 }, bakery: { count: 0 } })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const [momsSnap, bakerySnap] = await Promise.all([
          getDocs(collection(db, 'recipes_moms')),
          getDocs(collection(db, 'recipes_bakery')),
        ])

        const momsRecipes = momsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        const bakeryRecipes = bakerySnap.docs.map((d) => ({ id: d.id, ...d.data() }))

        const lastMoms = momsRecipes.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))[0]
        const lastBakery = bakeryRecipes.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))[0]

        setStats({
          moms: { count: momsRecipes.length, lastAdded: lastMoms?.title || null },
          bakery: { count: bakeryRecipes.length, lastAdded: lastBakery?.title || null },
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { stats, loading }
}

export async function addRecipe(cookbookType, recipeData) {
  const collectionName = cookbookType === 'moms' ? 'recipes_moms' : 'recipes_bakery'
  const docRef = await addDoc(collection(db, collectionName), {
    ...recipeData,
    cookbook: cookbookType,
    timesCooked: 0,
    rating: 0,
    lastMade: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateRecipe(cookbookType, recipeId, recipeData) {
  const collectionName = cookbookType === 'moms' ? 'recipes_moms' : 'recipes_bakery'
  await updateDoc(doc(db, collectionName, recipeId), {
    ...recipeData,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteRecipe(cookbookType, recipeId) {
  const collectionName = cookbookType === 'moms' ? 'recipes_moms' : 'recipes_bakery'
  await deleteDoc(doc(db, collectionName, recipeId))
}

export async function markMadeIt(cookbookType, recipeId, currentTimesCooked, rating) {
  const collectionName = cookbookType === 'moms' ? 'recipes_moms' : 'recipes_bakery'
  await updateDoc(doc(db, collectionName, recipeId), {
    timesCooked: (currentTimesCooked || 0) + 1,
    lastMade: serverTimestamp(),
    ...(rating && { rating }),
    updatedAt: serverTimestamp(),
  })
}

export async function uploadRecipePhotos(cookbookType, recipeId, files) {
  const urls = []
  for (const file of files) {
    const storageRef = ref(storage, `recipes/${cookbookType}/${recipeId}/${Date.now()}_${file.name}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    urls.push(url)
  }
  return urls
}
