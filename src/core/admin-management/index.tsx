import plusFill from '@iconify/icons-eva/plus-fill';
import { Icon } from '@iconify/react';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
// material
import {
    Button, Card, Container, IconButton, Stack, Table, TableBody,
    TableCell, TableContainer,
    TablePagination, TableRow, Typography
} from '@mui/material';
import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RouteName } from '../../app/routes';
import { selectRoute } from '../../slices/route-slice';
// components
import { Link as RouterLink } from 'react-router-dom';
import { getAllAdmin, User } from '../../slices/user-slice';
import Page from '../components/page';
import SearchNotFound from '../components/search-not-found';
import { UserListHead, UserListToolbar } from '../components/user';

//

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'username', label: 'Username', alignRight: false },
    { id: 'email', label: 'Email', alignRight: false },
    { id: 'firstName', label: 'Name', alignRight: false },
    { id: 'createdAt', label: 'Created At', alignRight: false },
    { id: '', label: '', alignRight: false },
];

// ----------------------------------------------------------------------

function descendingComparator(a: any, b: any, orderBy: string) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order: string, orderBy: string) {
    return order === 'desc'
        ? (a: any, b: any) => descendingComparator(a, b, orderBy)
        : (a: any, b: any) => -descendingComparator(a, b, orderBy);
}

function doSearch(values: string[], query: string) {
    if (values) {
        for (const value of values) {
            if (value.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                return true;
            }
        }
    }
    return false;
}

function applySortFilter(array: any[], comparator: any, query: string) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    if (query) {
        return filter(
            array,
            (_user) => doSearch([_user.username, _user.email, _user.firstName, _user.lastName], query)
        );
    }
    return stabilizedThis.map((el: any) => el[0]);
}

export default function UserManagement() {
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc' as const);
    const [orderBy, setOrderBy] = useState('username');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const dispatch = useAppDispatch();
    const users = useAppSelector((state) => state.userReducer.managementAdmins);

    useEffect(() => {
        dispatch(selectRoute(RouteName.ADMIN))
        if (users.length === 0) {
            dispatch(getAllAdmin());
        }
    }, [dispatch, users]);

    const handleRequestSort = (event: React.MouseEvent<HTMLElement>, property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? ('desc' as const) : ('asc' as const));
        setOrderBy(property);
    };

    const handleChangePage = (event: any, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterByName = (event: any) => {
        setFilterName(event.target.value);
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;

    const filteredUsers = applySortFilter(users, getComparator(order, orderBy), filterName);

    const isUserNotFound = filteredUsers.length === 0;

    return (
        <Page title="Users">
            <Container>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        Admins Management
                    </Typography>
                    <Button
                        variant="contained"
                        color='success'
                        startIcon={<Icon icon={plusFill} />}
                    >
                        New Admin
                    </Button>
                </Stack>

                <Card>
                    <UserListToolbar
                        filterName={filterName}
                        onFilterName={handleFilterByName}
                    />
                    <TableContainer sx={{ minWidth: 1000 }}>
                        <Table>
                            <UserListHead
                                order={order}
                                orderBy={orderBy}
                                headLabel={TABLE_HEAD}
                                rowCount={users.length}
                                onRequestSort={handleRequestSort}
                            />
                            <TableBody>
                                {filteredUsers
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row: User) => {
                                        const {
                                            _id,
                                            username,
                                            email,
                                            firstName,
                                            lastName,
                                            createdAt
                                        } = row;

                                        return (
                                            <TableRow
                                                hover
                                                key={_id}
                                                tabIndex={-1}
                                                role="checkbox"
                                            >
                                                <TableCell align="left">{username}</TableCell>
                                                <TableCell align="left">{email}</TableCell>
                                                <TableCell align="left">{`${firstName} ${lastName}`}</TableCell>
                                                <TableCell align="left">{new Date(createdAt!).toLocaleString("en")}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton component={RouterLink} to={`/users/${_id}`} target="_blank" rel="noopener noreferrer">
                                                        <RemoveRedEyeIcon />
                                                    </IconButton >
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                {emptyRows > 0 && (
                                    <TableRow style={{ height: 53 * emptyRows }}>
                                        <TableCell colSpan={6} />
                                    </TableRow>
                                )}
                            </TableBody>
                            {isUserNotFound && (
                                <TableBody>
                                    <TableRow>
                                        <TableCell align="center" colSpan={12}>
                                            <SearchNotFound searchQuery={filterName} />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )}
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={users.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Card>
            </Container>
        </Page >
    );
}
