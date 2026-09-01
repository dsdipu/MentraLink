useEffect(() => {
  const fetchMyGroupStudents = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/group`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const currentUserId = storedUser?._id;

      const myGroup = response.data.groups.find(
        (g) => g.mentor?.user?._id === currentUserId
      );

      if (myGroup) {
        setStudents(myGroup.students || []);
      } else {
        setError("No group found for this mentor");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students");
      console.error(err);
    }
  };

  fetchMyGroupStudents();
}, [token]);